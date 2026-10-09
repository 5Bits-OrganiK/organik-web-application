import {inject, Injectable} from '@angular/core';
import {ConservationStore} from '../../conservation/application/conservation.store';

@Injectable({providedIn: 'root'})
/**
 * Application service of the Communication bounded context: the alerts the minimarket has to act on.
 *
 * @remarks
 * Communication does not detect risks itself. It collects the alerts raised by the contexts that
 * do (today Conservation, derived from the sensor readings) and offers them to the presentation
 * layer, so the views that notify the user depend on one place.
 */
export class AlertsStore {
  private readonly conservation = inject(ConservationStore);

  /** Active alerts, most urgent first. */
  readonly alerts = this.conservation.alerts;

  /**
   * Loads the data the alerts are derived from.
   */
  loadAlerts(): void {
    this.conservation.loadConservation();
  }
}
