import {DomainError} from './domain-error';

/**
 * Value object representing a percentage between 0 and 100.
 */
export class Percentage {
  private constructor(readonly value: number) {}

  /**
   * @throws DomainError if the value is not a finite number between 0 and 100.
   */
  static of(value: number): Percentage {
    if (!Number.isFinite(value) || value < 0 || value > 100) {
      throw new DomainError(`A percentage must be between 0 and 100: ${value}`);
    }
    return new Percentage(value);
  }

  toString(): string {
    return `${this.value}%`;
  }
}
