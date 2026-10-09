import {Component, input} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {PrototypeInteraction} from '../../navigation/interactions';

@Component({
  imports: [RouterLink, MatIcon, TranslatePipe],
  selector: 'app-interaction-link',
  styleUrl: './interaction-link.css',
  templateUrl: './interaction-link.html',
})
/**
 * Link to one key interaction of the prototype, rendered as a card or as a compact chip.
 */
export class InteractionLink {
  /** Interaction to open. */
  interaction = input.required<PrototypeInteraction>();
  /** Presentation variant. */
  variant = input<'card' | 'chip'>('card');
}
