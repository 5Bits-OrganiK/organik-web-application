import {Component, input, OnInit, signal} from '@angular/core';

/** Duration of the count-up of a figure, in milliseconds. */
const COUNT_UP_MS = 1100;

@Component({
  selector: 'app-count-up',
  template: '{{ shown() ?? target() }}',
})
/**
 * Presentation component that shows a figure counting up to it when it appears.
 *
 * @remarks
 * It starts counting when it is created; the parent creates it again whenever the figure
 * changes, so every new figure is counted up too.
 */
export class CountUp implements OnInit {
  /** Formatted figure to count up to, e.g. `1,248`, `S/ 1,820` or `72%`. */
  target = input.required<string>();

  /** Value drawn while it counts up; `null` once the count ends, so the real figure shows. */
  protected readonly shown = signal<string | null>(null);

  ngOnInit(): void {
    const parts = /^(\D*)([\d,]+)(.*)$/.exec(this.target());
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
