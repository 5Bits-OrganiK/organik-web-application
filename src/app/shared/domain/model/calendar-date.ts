import {DomainError} from './domain-error';

const MS_PER_DAY = 86_400_000;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Value object representing a calendar day without a time component.
 *
 * @remarks
 * It is stored as an ISO-8601 date (`yyyy-MM-dd`) so it can be serialized and
 * compared without time-zone surprises.
 */
export class CalendarDate {
  private constructor(private readonly iso: string) {}

  /**
   * Creates a calendar date from an ISO date string or a `Date`.
   *
   * @param value - `yyyy-MM-dd` string, or a date whose local day is used.
   * @throws DomainError if the value is not a valid calendar day.
   */
  static of(value: string | Date): CalendarDate {
    if (value instanceof Date) {
      return CalendarDate.fromParts(value.getFullYear(), value.getMonth() + 1, value.getDate());
    }
    if (!ISO_DATE.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
      throw new DomainError(`Invalid calendar date: ${value}`);
    }
    return new CalendarDate(value);
  }

  private static fromParts(year: number, month: number, day: number): CalendarDate {
    const pad = (n: number, size = 2) => String(n).padStart(size, '0');
    return new CalendarDate(`${pad(year, 4)}-${pad(month)}-${pad(day)}`);
  }

  /** Returns a new date shifted by the given number of days. */
  plusDays(days: number): CalendarDate {
    const shifted = new Date(this.toUtcMs() + days * MS_PER_DAY);
    return CalendarDate.fromParts(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth() + 1,
      shifted.getUTCDate()
    );
  }

  /** Whole days between this date and the target (negative when the target is earlier). */
  daysUntil(target: CalendarDate): number {
    return Math.round((target.toUtcMs() - this.toUtcMs()) / MS_PER_DAY);
  }

  isBefore(other: CalendarDate): boolean {
    return this.iso < other.iso;
  }

  equals(other: CalendarDate): boolean {
    return this.iso === other.iso;
  }

  /** Returns the ISO-8601 date string (`yyyy-MM-dd`). */
  toString(): string {
    return this.iso;
  }

  /** Returns a `Date` at local midnight, suitable for the Angular `date` pipe. */
  toDate(): Date {
    const [year, month, day] = this.iso.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private toUtcMs(): number {
    return Date.parse(`${this.iso}T00:00:00Z`);
  }
}
