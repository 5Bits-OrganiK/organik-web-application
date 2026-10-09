import {Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {provideTranslateService} from '@ngx-translate/core';
import {DomainError} from '../../shared/domain/model/domain-error';
import {Clock} from '../../shared/domain/services/clock';
import {ReportExporter} from '../infrastructure/report-exporter';
import {AnalyticsStore} from './analytics.store';

/** Clock frozen on the day of the approved mockups. */
@Injectable()
class FixedClock extends Clock {
  override now(): Date {
    return new Date(2026, 9, 2, 12, 0);
  }
}

/** Lets the in-memory gateway answer, whatever latency the environment simulates. */
const settleGateway = () => vi.advanceTimersByTimeAsync(1_000);

describe('AnalyticsStore', () => {
  const exportAsPdf = vi.fn();
  let store: AnalyticsStore;

  beforeEach(async () => {
    vi.useFakeTimers();
    exportAsPdf.mockReset();
    TestBed.configureTestingModule({
      providers: [
        provideTranslateService(),
        {provide: Clock, useClass: FixedClock},
        {provide: ReportExporter, useValue: {exportAsPdf}}
      ]
    });
    store = TestBed.inject(AnalyticsStore);
    store.loadAnalytics();
    await settleGateway();
  });

  afterEach(() => vi.useRealTimers());

  it('should load the operational indicators', () => {
    const indicators = store.indicators();

    expect(indicators?.avoidedLoss.amount).toBe(1820);
    expect(indicators?.productsAtRisk).toBe(14);
    expect(indicators?.acceptedRequestsRate.toString()).toBe('72%');
    expect(indicators?.operationalHealth.value).toBe(87);
  });

  it('should load the alert trend', () => {
    expect(store.trend()?.points.length).toBe(6);
  });

  it('should export the report as a dated PDF', () => {
    const fileName = store.generateReport({from: '2026-09-02', to: '2026-10-02', indicators: ['alerts']});

    expect(fileName).toBe('organik-report-2026-10-02.pdf');
    expect(exportAsPdf).toHaveBeenCalledOnce();
    expect(exportAsPdf.mock.calls[0][0].lines.length).toBeGreaterThan(4);
  });

  it('should not export an invalid report', () => {
    expect(() =>
      store.generateReport({from: '2026-10-02', to: '2026-09-02', indicators: ['alerts']})
    ).toThrow(DomainError);
    expect(exportAsPdf).not.toHaveBeenCalled();
  });
});
