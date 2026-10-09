import {ConservationAlertService} from './conservation-alert.service';

describe('ConservationAlertService', () => {
  const service = new ConservationAlertService();

  it('should raise nothing when there are no problems', () => {
    expect(service.derive({expiringProducts: [], outOfRangeZones: [], shortageProducts: []})).toEqual([]);
  });

  it('should raise one alert per kind of problem, in presentation order', () => {
    const alerts = service.derive({
      expiringProducts: ['Tomate orgánico', 'Yogurt orgánico'],
      outOfRangeZones: ['Anaquel fresco'],
      shortageProducts: ['Tomate orgánico']
    });

    expect(alerts.map(alert => alert.type)).toEqual(['expiration', 'temperature', 'minimum-stock']);
    expect(alerts[0].subjects).toEqual(['Tomate orgánico', 'Yogurt orgánico']);
  });

  it('should treat temperature breaches as critical and the rest as informative', () => {
    const alerts = service.derive({
      expiringProducts: ['A'],
      outOfRangeZones: ['Z'],
      shortageProducts: ['B']
    });

    expect(alerts.map(alert => alert.severity)).toEqual(['info', 'critical', 'info']);
  });

  it('should not repeat a subject', () => {
    const [alert] = service.derive({
      expiringProducts: ['Tomate', 'Tomate'],
      outOfRangeZones: [],
      shortageProducts: []
    });

    expect(alert.subjects).toEqual(['Tomate']);
  });
});
