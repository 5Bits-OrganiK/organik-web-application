import {Component, input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {CountUp} from './count-up';

@Component({
  imports: [MatIcon, CountUp],
  selector: 'app-kpi-card',
  styleUrl: './kpi-card.css',
  templateUrl: './kpi-card.html',
})
/**
 * Presentation component that highlights one key figure, counting up to it when it appears.
 */
export class KpiCard {
  /** Already translated name of the figure. */
  label = input.required<string>();
  /** Formatted value of the figure, e.g. `1,248`, `S/ 1,820` or `72%`. */
  value = input.required<string>();
  /** `attention` draws the eye to figures that need action. */
  tone = input<'default' | 'attention'>('default');
  /** Already translated caption shown under the value. */
  note = input<string>();
  /** Material icon that represents the figure. */
  icon = input<string>();
}
