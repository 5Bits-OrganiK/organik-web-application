import {Injectable} from '@angular/core';
import {CalendarDate} from '../model/calendar-date';

/**
 * Domain port that provides the current moment.
 *
 * @remarks
 * Depending on this abstraction instead of `new Date()` keeps time-based rules
 * (expiration, freshness) deterministic and testable.
 */
@Injectable({providedIn: 'root', useFactory: () => new SystemClock()})
export abstract class Clock {
  /** Current instant. */
  abstract now(): Date;

  /** Current local calendar day. */
  today(): CalendarDate {
    return CalendarDate.of(this.now());
  }
}

/** Default {@link Clock} backed by the system time. */
export class SystemClock extends Clock {
  override now(): Date {
    return new Date();
  }
}
