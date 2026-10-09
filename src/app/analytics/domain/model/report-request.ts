import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';

/** Sections of the operation a report can cover. */
export type ReportIndicator = 'alerts' | 'requests' | 'inventory' | 'conservation';

/** Every indicator a report can cover. */
export const REPORT_INDICATORS: readonly ReportIndicator[] = [
  'alerts',
  'requests',
  'inventory',
  'conservation'
];

/** Longest period a single report can cover, in days. */
const MAX_PERIOD_DAYS = 366;

/**
 * Request to generate a report for the administrator.
 */
export class ReportRequest {
  /**
   * @param from - First day of the period.
   * @param to - Last day of the period.
   * @param indicators - Sections to include.
   * @throws DomainError if the period is inverted or too long, or no section is selected.
   */
  constructor(
    readonly from: CalendarDate,
    readonly to: CalendarDate,
    readonly indicators: readonly ReportIndicator[]
  ) {
    if (to.isBefore(from)) {
      throw new DomainError('The report period must end after it starts');
    }
    if (from.daysUntil(to) > MAX_PERIOD_DAYS) {
      throw new DomainError(`A report cannot cover more than ${MAX_PERIOD_DAYS} days`);
    }
    if (indicators.length === 0) {
      throw new DomainError('Select at least one indicator for the report');
    }
  }

  includes(indicator: ReportIndicator): boolean {
    return this.indicators.includes(indicator);
  }
}
