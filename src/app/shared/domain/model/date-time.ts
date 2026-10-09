import {DomainError} from './domain-error';

/**
 * Value object representing a date and time.
 */
export class DateTime {
  private readonly date: Date;

  /**
   * Creates a new DateTime instance.
   *
   * @param value - ISO-8601 string or Date object.
   * @throws DomainError if the value is not a valid date and time.
   */
  constructor(value: string | Date) {
    this.date = new Date(value);
    if (Number.isNaN(this.date.getTime())) {
      throw new DomainError(`Invalid date and time: ${value}`);
    }
  }

  /**
   * Returns the local date and time as `yyyy-MM-dd HH:mm`.
   */
  toDisplayString(): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const d = this.date;
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  /**
   * Returns the ISO-8601 string representation of the date and time.
   */
  toString(): string {
    return this.date.toISOString();
  }

  /**
   * Returns the Date object.
   */
  toDate(): Date {
    return new Date(this.date);
  }
}
