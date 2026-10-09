import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {ReportRequest} from './report-request';

const day = (iso: string) => CalendarDate.of(iso);

describe('ReportRequest', () => {
  it('should accept a valid period and sections', () => {
    const request = new ReportRequest(day('2026-09-02'), day('2026-10-02'), ['alerts', 'inventory']);

    expect(request.includes('alerts')).toBe(true);
    expect(request.includes('requests')).toBe(false);
  });

  it('should reject a period that ends before it starts', () => {
    expect(() => new ReportRequest(day('2026-10-02'), day('2026-09-02'), ['alerts'])).toThrow(DomainError);
  });

  it('should reject a period longer than a year', () => {
    expect(() => new ReportRequest(day('2025-01-01'), day('2026-10-02'), ['alerts'])).toThrow(DomainError);
  });

  it('should reject a report without sections', () => {
    expect(() => new ReportRequest(day('2026-09-02'), day('2026-10-02'), [])).toThrow(DomainError);
  });
});
