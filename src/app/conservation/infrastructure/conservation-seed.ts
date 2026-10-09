import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {StorageReadingResource, StorageZoneResource} from './conservation-response';

/**
 * Storage zones of the minimarket while the backend is not available.
 */
export const ZONES_SEED: StorageZoneResource[] = [
  {id: 'zone-cold-a', name: 'Cámara fría A', condition: 'cold'},
  {id: 'zone-fresh', name: 'Anaquel fresco', condition: 'fresh'},
  {id: 'zone-dry', name: 'Almacén seco', condition: 'dry'}
];

/**
 * Sensor readings of the last week while the backend is not available: one per zone and day, the
 * latest one on the given day, so the monitoring screen always shows recent data.
 *
 * @param today - Reference day.
 */
export function readingsSeed(today: CalendarDate): StorageReadingResource[] {
  const zones = [
    {zoneId: 'zone-cold-a', productId: 'ORG-01', temperatures: [3, 4, 5, 4, 3, 4, 4], humidities: [60, 62, 63, 61, 60, 62, 61], hour: '09:30'},
    {zoneId: 'zone-fresh', productId: 'ORG-02', temperatures: [7, 8, 8, 9, 8, 9, 9], humidities: [70, 71, 72, 73, 71, 72, 72], hour: '09:35'},
    {zoneId: 'zone-dry', productId: 'ORG-03', temperatures: [18, 19, 19, 20, 19, 19, 19], humidities: [44, 45, 46, 45, 44, 45, 45], hour: '09:40'}
  ];
  return zones.flatMap(zone =>
    zone.temperatures.map((temperature, index) => ({
      zoneId: zone.zoneId,
      productId: zone.productId,
      temperature,
      humidity: zone.humidities[index],
      recordedAt: `${today.plusDays(index - 6).toString()}T${zone.hour}:00`,
      source: 'simulated'
    }))
  );
}
