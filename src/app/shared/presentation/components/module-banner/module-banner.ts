import {Component, input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';

@Component({
  imports: [MatIcon],
  selector: 'app-module-banner',
  styleUrl: './module-banner.css',
  templateUrl: './module-banner.html',
})
/**
 * Card introducing a module, with an icon, a description and a projected primary action.
 */
export class ModuleBanner {
  /** Material icon that represents the module. */
  icon = input.required<string>();
  /** Already translated module headline. */
  heading = input.required<string>();
  /** Already translated supporting description. */
  description = input.required<string>();
}
