import {Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {Clock} from '../../shared/domain/services/clock';
import {ConservationStore} from './conservation.store';

/** Clock frozen on the day of the approved mockups. */
@Injectable()
class FixedClock extends Clock {
  override now(): Date {
    return new Date(2026, 9, 2, 12, 0);
  }
}

/** Lets the in-memory gateway answer, whatever latency the environment simulates. */
const settleGateway = () => vi.advanceTimersByTimeAsync(1_000);

describe('ConservationStore', () => {
  let store: ConservationStore;

  beforeEach(async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({providers: [{provide: Clock, useClass: FixedClock}]});
    store = TestBed.inject(ConservationStore);
    store.loadConservation();
    await settleGateway();
  });

  afterEach(() => vi.useRealTimers());

  it('should evaluate every zone against its own range', () => {
    expect(store.readingItems().map(item => [item.zoneName, item.status])).toEqual([
      ['Cámara fría A', 'normal'],
      ['Anaquel fresco', 'warning'],
      ['Almacén seco', 'normal']
    ]);
  });

  it('should derive the active alerts from readings, expirations and shortages', () => {
    expect(store.alerts().map(alert => alert.type)).toEqual(['expiration', 'temperature', 'minimum-stock']);
    expect(store.alertCount()).toBe(3);
  });

  it('should name the subjects behind each alert', () => {
    const byType = Object.fromEntries(store.alerts().map(alert => [alert.type, alert.subjects]));
    expect(byType['expiration']).toEqual(['Yogurt orgánico', 'Tomate orgánico']);
    expect(byType['temperature']).toEqual(['Anaquel fresco']);
    expect(byType['minimum-stock']).toEqual(['Tomate orgánico', 'Brócoli orgánico']);
  });

  it('should put the critical alert first when prioritizing', () => {
    expect(store.prioritizedAlerts().map(alert => alert.type)).toEqual([
      'temperature',
      'expiration',
      'minimum-stock'
    ]);
  });

  it('should keep the history of the last week with the origin of every reading', () => {
    const all = store.history({zoneId: null, from: null, to: null});

    expect(all.length).toBe(21);
    expect(all[0].recordedAt.toDisplayString() >= all[all.length - 1].recordedAt.toDisplayString()).toBe(true);
    expect(new Set(all.map(item => item.source))).toEqual(new Set(['simulated']));
  });

  it('should filter the history by zone and by range of days', () => {
    const zone = store.history({zoneId: 'zone-fresh', from: null, to: null});
    const range = store.history({zoneId: null, from: '2026-10-01', to: '2026-10-02'});

    expect(zone.length).toBe(7);
    expect(zone.every(item => item.zoneName === 'Anaquel fresco')).toBe(true);
    expect(range.length).toBe(6);
    expect(store.history({zoneId: null, from: '2027-01-01', to: null})).toEqual([]);
  });

  it('should show the latest reading of each zone, not the whole history', () => {
    expect(store.readingItems().length).toBe(3);
    expect(store.readingItems().every(item => item.recordedAt.toDisplayString().startsWith('2026-10-02'))).toBe(true);
    expect(store.zonesWithoutReadings()).toEqual([]);
  });
});
