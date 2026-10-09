import {inject, Injectable} from '@angular/core';
import {InventoryStore} from '../../inventory/application/inventory.store';
import {ExpirationPolicy} from '../../inventory/domain/model/expiration-policy';

const STORAGE_KEY = 'organik.expiration-policy';

/** Shape of the policy persisted in the browser. */
interface StoredPolicy {
  criticalDays: number;
  riskDays: number;
}

@Injectable({providedIn: 'root'})
/**
 * Application service that applies and remembers the administrator's settings.
 *
 * @remarks
 * The expiration thresholds feed the policy used by the inventory to classify lots.
 */
export class SettingsStore {
  private readonly inventory = inject(InventoryStore);

  /** Expiration policy currently in force. */
  readonly expirationPolicy = this.inventory.policy;

  /**
   * Applies the settings saved in a previous visit, if any.
   */
  restore(): void {
    const stored = this.read();
    if (!stored) {
      return;
    }
    try {
      this.inventory.updatePolicy(new ExpirationPolicy(stored.criticalDays, stored.riskDays));
    } catch {
      // Ignore a tampered or outdated value and keep the default policy.
    }
  }

  /**
   * Changes the expiration thresholds and remembers them.
   *
   * @param criticalDays - A lot with this many days left, or fewer, is critical.
   * @param riskDays - A lot with this many days left, or fewer, is at risk.
   * @throws DomainError if the thresholds are invalid.
   */
  saveExpirationPolicy(criticalDays: number, riskDays: number): void {
    this.inventory.updatePolicy(new ExpirationPolicy(criticalDays, riskDays));
    this.write({criticalDays, riskDays});
  }

  private read(): StoredPolicy | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as StoredPolicy) : null;
    } catch {
      return null;
    }
  }

  private write(policy: StoredPolicy): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(policy));
    } catch {
      // Storage can be unavailable (private mode); the settings then only last for this visit.
    }
  }
}
