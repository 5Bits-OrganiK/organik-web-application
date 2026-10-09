import {ConservationAlert} from '../model/conservation-alert';

/**
 * Facts the alert rules are evaluated against, expressed by the names to report.
 */
export interface AlertSignals {
  /** Products with lots close to expiring. */
  expiringProducts: readonly string[];
  /** Zones whose last reading is outside the range. */
  outOfRangeZones: readonly string[];
  /** Products whose stock is under the minimum. */
  shortageProducts: readonly string[];
}

/**
 * Domain service that turns conservation facts into the alerts shown to the user.
 *
 * @remarks
 * One alert is raised per kind of problem. Temperature breaches are critical because
 * they endanger the whole zone at once; the others only require an action.
 */
export class ConservationAlertService {
  /**
   * @param signals - Current facts about expirations, zones and stock.
   * @returns The active alerts, in the order they are presented.
   */
  derive(signals: AlertSignals): ConservationAlert[] {
    const alerts: ConservationAlert[] = [];
    if (signals.expiringProducts.length > 0) {
      alerts.push(new ConservationAlert('expiration', 'info', unique(signals.expiringProducts)));
    }
    if (signals.outOfRangeZones.length > 0) {
      alerts.push(new ConservationAlert('temperature', 'critical', unique(signals.outOfRangeZones)));
    }
    if (signals.shortageProducts.length > 0) {
      alerts.push(new ConservationAlert('minimum-stock', 'info', unique(signals.shortageProducts)));
    }
    return alerts;
  }
}

const unique = (values: readonly string[]): string[] => [...new Set(values)];
