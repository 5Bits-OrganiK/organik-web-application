import {RoleId} from './role';

/** Roles a person can choose when signing up. */
export type SignUpRole = Extract<RoleId, 'administrator' | 'supplier'>;

/**
 * Data a person provides to create an OrganiK account.
 */
export interface Registration {
  fullName: string;
  email: string;
  /** Whether the person runs a minimarket (`administrator`) or supplies products to minimarkets (`supplier`). */
  role: SignUpRole;
  /** Name of the minimarket or of the supplier company. */
  company: string;
  password: string;
  /** Plan chosen on the landing page, when the visitor came from it. */
  plan?: string;
}
