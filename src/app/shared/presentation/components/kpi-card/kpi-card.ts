import {Component, input, OnInit, signal} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

/** Duration of the count-up of a figure, in milliseconds. */
const COUNT_UP_MS = 1100;

@Component({
  imports: [MatIcon],
  selector: 'app-kpi-card',
  styleUrl: './kpi-card.css',
  templateUrl: './kpi-card.html',
})
/**
 * Presentation component that highlights one key figure, counting up to it when it appears.
 */
export class KpiCard implements OnInit {
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

  /** Value drawn while it counts up; `null` once the count ends, so the real value shows. */
  protected readonly shown = signal<string | null>(null);

  ngOnInit(): void {
    this.countUpTo(this.value());
  }

  private countUpTo(target: string): void {
    const parts = /^(\D*)([\d,]+)(.*)$/.exec(target);
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!parts || reduced) {
      return;
    }
    const [, prefix, digits, suffix] = parts;
    const end = Number(digits.replace(/,/g, ''));
    const grouped = digits.includes(',');
    const format = (n: number) => (grouped ? n.toLocaleString('en-US') : String(n));
    const startedAt = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - startedAt) / COUNT_UP_MS, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      if (progress < 1) {
        this.shown.set(prefix + format(Math.round(end * eased)) + suffix);
        requestAnimationFrame(step);
      } else {
        this.shown.set(null);
      }
    };
    requestAnimationFrame(step);
  }
}
