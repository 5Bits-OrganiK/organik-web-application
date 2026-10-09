import {Component, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {AlertTrend} from '../../../domain/model/alert-trend';

@Component({
  imports: [TranslatePipe],
  selector: 'app-alert-trend-chart',
  styleUrl: './alert-trend-chart.css',
  templateUrl: './alert-trend-chart.html',
})
/**
 * Bar chart of the alerts raised per period; periods with an abnormal growth are highlighted.
 */
export class AlertTrendChart {
  /** Series to draw. */
  trend = input.required<AlertTrend>();

  /**
   * Height of a bar relative to the tallest one.
   *
   * @param count - Alerts of the period.
   */
  protected ratio(count: number): number {
    const peak = this.trend().peak;
    return peak === 0 ? 0 : count / peak;
  }
}
