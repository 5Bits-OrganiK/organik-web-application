import {DomainError} from '../../../shared/domain/model/domain-error';

/**
 * Why a registration was refused.
 *
 * - `email-taken`: there is already an account with that e-mail.
 */
export type RegistrationFailure = 'email-taken';

/**
 * Error raised when a new account cannot be created.
 */
export class RegistrationError extends DomainError {
  constructor(readonly reason: RegistrationFailure) {
    super(`Registration failed: ${reason}`);
    this.name = 'RegistrationError';
  }
}
