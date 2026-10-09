import {inject, Injectable, signal} from '@angular/core';
import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {AlertTrend} from '../domain/model/alert-trend';
import {OperationalIndicators} from '../domain/model/operational-indicators';
import {ReportIndicator, ReportRequest} from '../domain/model/report-request';
import {AnalyticsApi} from '../infrastructure/analytics-api';
import {ReportExporter} from '../infrastructure/report-exporter';
import {ReportComposer} from './report-composer';

/**
 * Data collected by the "generate report" form.
 */
export interface GenerateReportCommand {
  /** First day of the period in ISO-8601 format (`yyyy-MM-dd`). */
  from: string;
  /** Last day of the period in ISO-8601 format (`yyyy-MM-dd`). */
  to: string;
  indicators: ReportIndicator[];
}

@Injectable({providedIn: 'root'})
/**
 * Application service that coordinates the state of the Analytics bounded context.
 */
export class AnalyticsStore {
  private readonly api = inject(AnalyticsApi);
  private readonly exporter = inject(ReportExporter);
  private readonly composer = inject(ReportComposer);

  private readonly indicatorsSignal = signal<OperationalIndicators | null>(null);
  private readonly trendSignal = signal<AlertTrend | null>(null);
  private loaded = false;

  /** Operational indicators, or `null` until they are loaded. */
  readonly indicators = this.indicatorsSignal.asReadonly();
  /** Alerts raised per week, or `null` until they are loaded. */
  readonly trend = this.trendSignal.asReadonly();

  /**
   * Loads indicators and trend once; later calls reuse the cached data.
   */
  loadAnalytics(): void {
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    this.api.getIndicators().subscribe(indicators => this.indicatorsSignal.set(indicators));
    this.api.getAlertTrend().subscribe(trend => this.trendSignal.set(trend));
  }

  /**
   * Generates the report and hands it to the user as a PDF download.
   *
   * @param command - Data collected by the form.
   * @returns The name of the generated file.
   * @throws DomainError if the period or the sections are invalid.
   */
  generateReport(command: GenerateReportCommand): string {
    const request = new ReportRequest(
      CalendarDate.of(command.from),
      CalendarDate.of(command.to),
      command.indicators
    );
    const report = this.composer.compose(request, this.indicatorsSignal());
    this.exporter.exportAsPdf(report);
    return report.fileName;
  }
}
