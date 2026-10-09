import {Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {AlertItem} from '../../components/alert-item/alert-item';
import {AlertsStore} from '../../../application/alerts.store';
import {AnalyticsStore} from '../../../../analytics/application/analytics.store';
import {AlertTrendChart} from '../../../../analytics/presentation/components/alert-trend-chart/alert-trend-chart';
import {KpiCard} from '../../../../shared/presentation/components/kpi-card/kpi-card';

@Component({
  imports: [
    RouterLink,
    MatAnchor,
    TranslatePipe,
    KpiCard,
    AlertTrendChart,
    AlertItem
  ],
  selector: 'app-alerts-overview',
  styleUrl: './alerts-overview.css',
  templateUrl: './alerts-overview.html',
})
/**
 * View that combines the key figures, the alert trend and the active alerts.
 */
export class AlertsOverview implements OnInit {
  private readonly analytics = inject(AnalyticsStore);
  private readonly alertsStore = inject(AlertsStore);

  protected readonly indicators = this.analytics.indicators;
  protected readonly trend = this.analytics.trend;
  protected readonly alerts = this.alertsStore.alerts;

  ngOnInit(): void {
    this.analytics.loadAnalytics();
    this.alertsStore.loadAlerts();
  }
}
