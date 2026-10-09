import {DomainError} from './domain-error';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Value object representing a syntactically valid e-mail address.
 */
export class EmailAddress {
  private readonly address: string;

  /**
   * @param value - The e-mail address; surrounding spaces are trimmed and the case is normalized.
   * @throws DomainError if the address structure is invalid.
   */
  constructor(value: string) {
    const normalized = value.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(normalized)) {
      throw new DomainError(`Invalid e-mail address: ${value}`);
    }
    this.address = normalized;
  }

  /** Checks if a string is a valid e-mail address. */
  static isValid(value: string): boolean {
    return EMAIL_PATTERN.test(value.trim());
  }

  equals(other: EmailAddress): boolean {
    return this.address === other.address;
  }

  toString(): string {
    return this.address;
  }
}
