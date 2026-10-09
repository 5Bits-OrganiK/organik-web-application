import {CalendarDate} from './calendar-date';
import {DomainError} from './domain-error';

describe('CalendarDate', () => {
  it('should reject strings that are not ISO calendar days', () => {
    expect(() => CalendarDate.of('02/10/2026')).toThrow(DomainError);
    expect(() => CalendarDate.of('2026-13-40')).toThrow(DomainError);
  });

  it('should count whole days until a later date', () => {
    const today = CalendarDate.of('2026-10-02');
    expect(today.daysUntil(CalendarDate.of('2026-10-09'))).toBe(7);
    expect(today.daysUntil(CalendarDate.of('2026-09-30'))).toBe(-2);
  });

  it('should shift across month and year boundaries', () => {
    expect(CalendarDate.of('2026-12-30').plusDays(3).toString()).toBe('2027-01-02');
    expect(CalendarDate.of('2026-03-01').plusDays(-1).toString()).toBe('2026-02-28');
  });

  it('should build a date from the local day of a Date', () => {
    expect(CalendarDate.of(new Date(2026, 9, 2, 23, 59)).toString()).toBe('2026-10-02');
  });

  it('should compare dates by value', () => {
    expect(CalendarDate.of('2026-10-02').equals(CalendarDate.of('2026-10-02'))).toBe(true);
    expect(CalendarDate.of('2026-10-01').isBefore(CalendarDate.of('2026-10-02'))).toBe(true);
  });
});
