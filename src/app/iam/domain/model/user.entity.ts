import {DomainError} from '../../../shared/domain/model/domain-error';
import {EmailAddress} from '../../../shared/domain/model/email-address';
import {ModuleKey, Role} from './role';

/** Whether the person already accepted the invitation to use OrganiK. */
export type UserStatus = 'accepted' | 'pending';

/**
 * Data required to build a {@link User}.
 */
export interface UserProps {
  id: string;
  fullName: string;
  email: EmailAddress;
  role: Role;
  assignedModule: ModuleKey;
  status: UserStatus;
  notes: string;
  /** Minimarket the user works for; empty for suppliers. */
  minimarketId?: string;
  /** Supplier company the user works for; `null` for the people of a minimarket. */
  supplierId?: string | null;
  /** Plan chosen when the user signed up. */
  plan?: string;
}

/**
 * Represents a person who can sign in to OrganiK with a role.
 */
export class User {
  /** Identifier of the user, e.g. `usr-1`. */
  readonly id: string;
  readonly fullName: string;
  readonly email: EmailAddress;
  readonly role: Role;
  /** Module the user lands on and works with the most. */
  readonly assignedModule: ModuleKey;
  readonly status: UserStatus;
  readonly notes: string;
  readonly minimarketId: string;
  readonly supplierId: string | null;
  readonly plan: string;

  /**
   * @throws DomainError if the identifier or the name is blank, or the role cannot access the assigned module.
   */
  constructor(props: UserProps) {
    if (!props.id.trim() || !props.fullName.trim()) {
      throw new DomainError('A user needs an identifier and a full name');
    }
    if (props.role.accessTo(props.assignedModule) === 'none') {
      throw new DomainError(`The role ${props.role.id} cannot access ${props.assignedModule}`);
    }
    this.id = props.id;
    this.fullName = props.fullName.trim();
    this.email = props.email;
    this.role = props.role;
    this.assignedModule = props.assignedModule;
    this.status = props.status;
    this.notes = props.notes.trim();
    this.minimarketId = props.minimarketId ?? '';
    this.supplierId = props.supplierId ?? null;
    this.plan = props.plan ?? '';
  }

  /** Whether the user can accept or reject the orders addressed to their minimarket. */
  get canDecideOrders(): boolean {
    return this.role.id === 'administrator' && this.minimarketId !== '';
  }

  /** Whether the user is still waiting to accept the invitation, so it can be sent again. */
  get canResendInvitation(): boolean {
    return this.status === 'pending';
  }

  /**
   * Returns the user with other values for the editable fields.
   *
   * @param changes - Fields to replace.
   * @throws DomainError if the result violates an invariant.
   */
  with(changes: Partial<Omit<UserProps, 'id'>>): User {
    return new User({...this, ...changes});
  }
}
