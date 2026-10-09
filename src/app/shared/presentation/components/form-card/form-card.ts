import {Component, input} from '@angular/core';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  imports: [TranslatePipe],
  selector: 'app-form-card',
  styleUrl: './form-card.css',
  templateUrl: './form-card.html',
})
/**
 * Shared shell of the action screens: heading, field grid, expected validation note and actions.
 *
 * @remarks
 * Fields are projected into the default slot and buttons into `[formActions]`.
 */
export class FormCard {
  /** Already translated heading of the action. */
  heading = input.required<string>();
  /** Already translated supporting text. Defaults to the shared prototype note. */
  description = input<string>();
}
