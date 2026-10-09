import {Component, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';
import {ConservationAlert} from '../../../../conservation/domain/model/conservation-alert';

@Component({
  imports: [TranslatePipe],
  selector: 'app-alert-item',
  styleUrl: './alert-item.css',
  templateUrl: './alert-item.html',
})
/**
 * Presentation component that shows one active alert with the subjects that triggered it.
 */
export class AlertItem {
  /** Alert to display. */
  alert = input.required<ConservationAlert>();
}
