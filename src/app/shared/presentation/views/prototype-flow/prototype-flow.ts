import {Component} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {InteractionLink} from '../../components/interaction-link/interaction-link';
import {LanguageSwitcher} from '../../components/language-switcher/language-switcher';
import {PROTOTYPE_INTERACTIONS} from '../../navigation/interactions';

/** A step of the recommended walkthrough. */
interface WalkthroughStep {
  label: string;
  tone: 'blue' | 'green' | 'orange' | 'navy';
}

@Component({
  imports: [
    RouterLink,
    MatAnchor,
    TranslatePipe,
    InteractionLink,
    LanguageSwitcher
  ],
  selector: 'app-prototype-flow',
  styleUrl: './prototype-flow.css',
  templateUrl: './prototype-flow.html',
})
/**
 * Entry point of the prototype: recommended walkthrough, shortcuts, interaction map and demo notes.
 */
export class PrototypeFlow {
  /** Every key interaction wired in the prototype. */
  protected readonly interactions = PROTOTYPE_INTERACTIONS;

  /** Suggested order to present the prototype. */
  protected readonly steps: readonly WalkthroughStep[] = [
    {label: 'flow.step-dashboard', tone: 'blue'},
    {label: 'flow.step-crud', tone: 'green'},
    {label: 'flow.step-alerts', tone: 'orange'},
    {label: 'flow.step-users', tone: 'navy'}
  ];

  /** Presenter notes, as translation keys. */
  protected readonly notes = ['flow.note-start', 'flow.note-actions', 'flow.note-map'];
}
