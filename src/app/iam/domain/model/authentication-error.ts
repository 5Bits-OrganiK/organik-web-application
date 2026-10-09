import {DomainError} from '../../../shared/domain/model/domain-error';

/**
 * Why a sign-in attempt was refused.
 *
 * - `invalid-credentials`: the e-mail or the password is wrong. It is deliberately the same
 *   answer for both so nobody can discover which e-mails exist.
 * - `pending-invitation`: the user has not accepted the invitation yet.
 */
export type AuthenticationFailure = 'invalid-credentials' | 'pending-invitation';

/**
 * Error raised when a sign-in attempt is refused.
 */
export class AuthenticationError extends DomainError {
  constructor(readonly reason: AuthenticationFailure) {
    super(`Authentication failed: ${reason}`);
    this.name = 'AuthenticationError';
  }
}
