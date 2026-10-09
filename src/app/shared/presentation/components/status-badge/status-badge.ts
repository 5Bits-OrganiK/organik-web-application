import {Component, input} from '@angular/core';

/** Visual tone of a status badge. */
export type BadgeTone = 'info' | 'warning' | 'danger' | 'success' | 'neutral';

@Component({
  imports: [],
  selector: 'app-status-badge',
  styleUrl: './status-badge.css',
  templateUrl: './status-badge.html',
})
/**
 * Compact pill that communicates the state of a record.
 */
export class StatusBadge {
  /** Tone that maps the state to a color. */
  tone = input<BadgeTone>('neutral');
}
