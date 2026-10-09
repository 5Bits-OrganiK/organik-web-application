/**
 * Error raised when a domain invariant is violated.
 *
 * @remarks
 * Entities and value objects throw it from their constructors and behaviors so
 * that invalid state can never be represented.
 */
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainError';
  }
}
