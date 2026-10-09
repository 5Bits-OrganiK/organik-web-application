import {Component, DestroyRef, effect, inject, input, signal} from '@angular/core';
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
export class KpiCard {
  private readonly destroyRef = inject(DestroyRef);
  private frame = 0;

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

  /** Value currently drawn while it counts up. */
  protected readonly shown = signal('');

  constructor() {
    effect(() => this.countUpTo(this.value()));
    this.destroyRef.onDestroy(() => cancelAnimationFrame(this.frame));
  }

  private countUpTo(target: string): void {
    cancelAnimationFrame(this.frame);
    const parts = /^(\D*)([\d,]+)(.*)$/.exec(target);
    const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!parts || reduced) {
      this.shown.set(target);
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
      this.shown.set(prefix + format(Math.round(end * eased)) + suffix);
      if (progress < 1) {
        this.frame = requestAnimationFrame(step);
      }
    };
    this.frame = requestAnimationFrame(step);
  }
}
