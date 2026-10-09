import {inject, Injectable} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {ConservationStore} from '../../conservation/application/conservation.store';
import {InventoryStore} from '../../inventory/application/inventory.store';
import {RequisitionStore} from '../../requisition/application/requisition.store';
import {Clock} from '../../shared/domain/services/clock';
import {DateTime} from '../../shared/domain/model/date-time';
import {OperationalIndicators} from '../domain/model/operational-indicators';
import {ReportRequest} from '../domain/model/report-request';
import {PdfLine} from '../infrastructure/pdf-document-builder';
import {ReportDocument} from '../infrastructure/report-exporter';

/**
 * Application service that gathers the figures of every context into a report.
 */
@Injectable({providedIn: 'root'})
export class ReportComposer {
  private readonly translate = inject(TranslateService);
  private readonly clock = inject(Clock);
  private readonly inventory = inject(InventoryStore);
  private readonly requisition = inject(RequisitionStore);
  private readonly conservation = inject(ConservationStore);

  /**
   * Composes the report document for the requested period and sections.
   *
   * @param request - What the administrator asked to include.
   * @param indicators - Operational indicators, when they are already loaded.
   */
  compose(request: ReportRequest, indicators: OperationalIndicators | null): ReportDocument {
    const t = (key: string, params?: Record<string, unknown>) =>
      String(this.translate.instant(key, params));
    const lines: PdfLine[] = [
      {text: t('reports.document.title'), bold: true},
      {text: t('reports.document.period', {from: request.from.toString(), to: request.to.toString()})},
      {text: t('reports.document.generated', {at: new DateTime(this.clock.now()).toDisplayString()})},
      {text: ''}
    ];

    if (indicators) {
      lines.push(
        {text: t('reports.document.indicators'), bold: true},
        {text: `${t('analytics.kpi.avoided-loss')}: ${indicators.avoidedLoss.format()}`},
        {text: `${t('analytics.kpi.products-at-risk')}: ${indicators.productsAtRisk}`},
        {text: `${t('analytics.kpi.accepted-requests')}: ${indicators.acceptedRequestsRate}`},
        {text: `${t('reports.document.health')}: ${indicators.operationalHealth}`},
        {text: ''}
      );
    }
    if (request.includes('alerts')) {
      lines.push({text: t('reports.indicators.alerts'), bold: true});
      for (const alert of this.conservation.alerts()) {
        lines.push({text: `- ${t('alerts.types.' + alert.type)}: ${alert.subjects.join(', ')}`});
      }
      lines.push({text: ''});
    }
    if (request.includes('requests')) {
      const items = this.requisition.requestItems();
      const count = (status: string) => items.filter(item => item.status === status).length;
      lines.push(
        {text: t('reports.indicators.requests'), bold: true},
        {text: `${t('requests.status.pending')}: ${count('pending')}`},
        {text: `${t('requests.status.accepted')}: ${count('accepted')}`},
        {text: `${t('requests.status.rejected')}: ${count('rejected')}`},
        {text: ''}
      );
    }
    if (request.includes('inventory')) {
      lines.push(
        {text: t('reports.indicators.inventory'), bold: true},
        {text: `${t('reports.document.units')}: ${this.inventory.totalUnits()}`}
      );
      for (const item of this.inventory.items()) {
        lines.push({
          text: `${item.lotCode}  ${item.productName}  ${item.quantity}  ${item.expiresOn.toString()}  ${t('status.' + item.status)}`
        });
      }
      lines.push({text: ''});
    }
    if (request.includes('conservation')) {
      lines.push({text: t('reports.indicators.conservation'), bold: true});
      for (const reading of this.conservation.readingItems()) {
        lines.push({
          text: `${reading.zoneName}: ${reading.temperature} °C, ${reading.humidity} %  (${t('conservation.status.' + reading.status)})`
        });
      }
    }

    return {fileName: `organik-report-${this.clock.today().toString()}.pdf`, lines};
  }
}
