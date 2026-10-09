import {DomainError} from './domain-error';

/**
 * Value object representing a non-negative whole number of units.
 */
export class Quantity {
  private constructor(readonly value: number) {}

  /**
   * @throws DomainError if the value is not a non-negative integer.
   */
  static of(value: number): Quantity {
    if (!Number.isInteger(value) || value < 0) {
      throw new DomainError(`Quantity must be a non-negative integer: ${value}`);
    }
    return new Quantity(value);
  }

  static zero(): Quantity {
    return new Quantity(0);
  }

  plus(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }

  /**
   * Subtracts units.
   *
   * @throws DomainError if there are fewer units than the ones to subtract.
   */
  minus(other: Quantity): Quantity {
    return Quantity.of(this.value - other.value);
  }

  isLessThan(other: Quantity): boolean {
    return this.value < other.value;
  }

  isMoreThan(other: Quantity): boolean {
    return this.value > other.value;
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return String(this.value);
  }
}
