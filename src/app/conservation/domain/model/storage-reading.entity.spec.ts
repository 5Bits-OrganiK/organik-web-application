import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DateTime} from '../../../shared/domain/model/date-time';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {StorageReading} from './storage-reading.entity';

describe('StorageReading', () => {
  const reading = new StorageReading('zone-cold-a', 'ORG-01', 4, 61, new DateTime('2026-10-02T09:30:00'));

  it('should be simulated unless a sensor is declared', () => {
    expect(reading.source).toBe('simulated');
    expect(new StorageReading('z', 'p', 4, 61, new DateTime('2026-10-02T09:30:00'), 'sensor').source).toBe('sensor');
  });

  it('should tell whether it was taken inside a range of days, limits included', () => {
    expect(reading.isTakenBetween(CalendarDate.of('2026-10-02'), CalendarDate.of('2026-10-02'))).toBe(true);
    expect(reading.isTakenBetween(CalendarDate.of('2026-10-03'), null)).toBe(false);
    expect(reading.isTakenBetween(null, CalendarDate.of('2026-10-01'))).toBe(false);
    expect(reading.isTakenBetween(null, null)).toBe(true);
  });

  it('should refuse a humidity outside 0-100 %', () => {
    expect(() => new StorageReading('z', 'p', 4, 101, new DateTime('2026-10-02T09:30:00'))).toThrow(DomainError);
  });
});
