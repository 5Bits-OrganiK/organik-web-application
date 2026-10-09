import {Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {ModuleBanner} from '../../../../shared/presentation/components/module-banner/module-banner';
import {AnalyticsStore} from '../../../application/analytics.store';
import {AlertTrendChart} from '../../components/alert-trend-chart/alert-trend-chart';
import {KpiCard} from '../../../../shared/presentation/components/kpi-card/kpi-card';

@Component({
  imports: [
    RouterLink,
    MatAnchor,
    TranslatePipe,
    ModuleBanner,
    KpiCard,
    AlertTrendChart
  ],
  selector: 'app-analytics-overview',
  styleUrl: './analytics-overview.css',
  templateUrl: './analytics-overview.html',
})
/**
 * View with the operational indicators and the entry point to generate reports.
 */
export class AnalyticsOverview implements OnInit {
  private readonly analytics = inject(AnalyticsStore);

  protected readonly indicators = this.analytics.indicators;
  protected readonly trend = this.analytics.trend;

  ngOnInit(): void {
    this.analytics.loadAnalytics();
  }
}
