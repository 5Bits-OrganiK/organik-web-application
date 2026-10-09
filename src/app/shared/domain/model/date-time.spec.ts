import {DateTime} from './date-time';
import {DomainError} from './domain-error';

describe('DateTime', () => {
  it('should display the local date and time without seconds', () => {
    expect(new DateTime('2026-09-18T09:30:00').toDisplayString()).toBe('2026-09-18 09:30');
  });

  it('should reject values that are not dates', () => {
    expect(() => new DateTime('yesterday-ish')).toThrow(DomainError);
  });

  it('should hand out copies of the underlying date', () => {
    const time = new DateTime('2026-09-18T09:30:00');
    time.toDate().setFullYear(1999);
    expect(time.toDisplayString()).toBe('2026-09-18 09:30');
  });
});
