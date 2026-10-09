import {DomainError} from './domain-error';

/**
 * Value object representing an amount of money in a given currency.
 */
export class Money {
  private constructor(
    readonly amount: number,
    readonly currency: string
  ) {}

  /**
   * @param amount - Non-negative amount.
   * @param currency - ISO-4217 currency code. Defaults to Peruvian sol.
   * @throws DomainError if the amount is negative or not finite.
   */
  static of(amount: number, currency = 'PEN'): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new DomainError(`Invalid money amount: ${amount}`);
    }
    return new Money(amount, currency);
  }

  /** Formats the amount for the given locale, hiding decimals for whole amounts. */
  format(locale = 'es-PE'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currency,
      minimumFractionDigits: Number.isInteger(this.amount) ? 0 : 2
    }).format(this.amount);
  }
}
