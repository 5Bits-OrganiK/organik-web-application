import {DomainError} from '../../../shared/domain/model/domain-error';
import {StockStatus} from './stock-status';

/**
 * Policy that classifies a lot by the days left before it expires.
 */
export class ExpirationPolicy {
  /**
   * @param criticalDays - A lot with this many days left, or fewer, is critical.
   * @param riskDays - A lot with this many days left, or fewer, is at risk.
   * @throws DomainError if the thresholds are negative or not increasing.
   */
  constructor(
    readonly criticalDays: number,
    readonly riskDays: number
  ) {
    if (!Number.isInteger(criticalDays) || !Number.isInteger(riskDays) || criticalDays < 0) {
      throw new DomainError('Expiration thresholds must be whole non-negative days');
    }
    if (riskDays <= criticalDays) {
      throw new DomainError('The risk threshold must be greater than the critical threshold');
    }
  }

  /** Policy used until the administrator configures another one. */
  static default(): ExpirationPolicy {
    return new ExpirationPolicy(3, 7);
  }

  /**
   * Classifies a lot.
   *
   * @param daysToExpire - Whole days before the expiration date; negative when already expired.
   */
  statusFor(daysToExpire: number): StockStatus {
    if (daysToExpire <= this.criticalDays) {
      return 'critical';
    }
    return daysToExpire <= this.riskDays ? 'risk' : 'normal';
  }
}
