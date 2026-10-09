import {inject, Injectable, signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {DomainError} from '../../shared/domain/model/domain-error';
import {EmailAddress} from '../../shared/domain/model/email-address';
import {MODULE_KEYS, ModuleKey, ROLES, RoleId} from '../domain/model/role';
import {User, UserStatus} from '../domain/model/user.entity';
import {IamApi} from '../infrastructure/iam-api';

/**
 * Data collected by the "new user" and "edit user" forms.
 */
export interface SaveUserCommand {
  fullName: string;
  email: string;
  role: RoleId;
  assignedModule: ModuleKey;
  status: UserStatus;
  notes: string;
}

@Injectable({providedIn: 'root'})
/**
 * Application service that coordinates the users of the Identity and Access bounded context.
 */
export class UsersStore {
  private readonly api = inject(IamApi);

  private readonly usersSignal = signal<User[]>([]);
  private loaded = false;

  /** Read-only projection of the users. */
  readonly users = this.usersSignal.asReadonly();

  /**
   * Loads the users once; later calls reuse the cached list.
   */
  loadUsers(): void {
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    this.api.getUsers().subscribe(users => this.usersSignal.set(users));
  }

  /**
   * Adds a user created elsewhere (for example by the sign-up) to the loaded list.
   *
   * @param user - User to add; ignored when it is already listed.
   */
  append(user: User): void {
    this.usersSignal.update(current => (current.some(candidate => candidate.id === user.id) ? current : [...current, user]));
  }

  /**
   * Finds a user by identifier in the loaded list.
   *
   * @param id - User identifier.
   */
  findById(id: string): User | undefined {
    return this.usersSignal().find(user => user.id === id);
  }

  /**
   * Creates a user.
   *
   * @param command - Data collected by the form.
   * @throws DomainError if the e-mail is already in use or the data violates a user invariant.
   */
  createUser(command: SaveUserCommand): Observable<User> {
    if (this.emailInUse(command.email)) {
      throw new DomainError(`The e-mail ${command.email} is already in use`);
    }
    const user = new User({id: this.nextId(), ...this.toProps(command)});
    return this.api
      .createUser(user)
      .pipe(tap(created => this.usersSignal.update(current => [...current, created])));
  }

  /**
   * Updates an existing user.
   *
   * @param id - Identifier of the user to update.
   * @param command - Data collected by the form.
   * @throws DomainError if the user does not exist, the e-mail belongs to someone else or the data is invalid.
   */
  updateUser(id: string, command: SaveUserCommand): Observable<User> {
    const existing = this.findById(id);
    if (!existing) {
      throw new DomainError(`User ${id} does not exist`);
    }
    if (this.emailInUse(command.email, id)) {
      throw new DomainError(`The e-mail ${command.email} is already in use`);
    }
    return this.api
      .updateUser(existing.with(this.toProps(command)))
      .pipe(
        tap(updated =>
          this.usersSignal.update(current => current.map(user => (user.id === id ? updated : user)))
        )
      );
  }

  /**
   * Sends the invitation again to a user who has not accepted it yet.
   *
   * @param id - Identifier of the user.
   * @throws DomainError if the user does not exist or already accepted the invitation.
   */
  resendInvitation(id: string): Observable<User> {
    const user = this.findById(id);
    if (!user?.canResendInvitation) {
      throw new DomainError(`User ${id} has no pending invitation`);
    }
    return this.api.resendInvitation(user);
  }

  private toProps(command: SaveUserCommand) {
    const role = ROLES.find(candidate => candidate.id === command.role);
    if (!role || !MODULE_KEYS.includes(command.assignedModule)) {
      throw new DomainError('Unknown role or module');
    }
    return {
      fullName: command.fullName,
      email: new EmailAddress(command.email),
      role,
      assignedModule: command.assignedModule,
      status: command.status,
      notes: command.notes
    };
  }

  private emailInUse(email: string, exceptUserId?: string): boolean {
    const normalized = email.trim().toLowerCase();
    return this.usersSignal().some(
      user => user.id !== exceptUserId && user.email.toString() === normalized
    );
  }

  /** Identifier that follows the highest one in use, e.g. `usr-4`. */
  private nextId(): string {
    const highest = this.usersSignal()
      .map(user => Number(user.id.replace(/^\D+/, '')))
      .reduce((max, value) => (Number.isFinite(value) ? Math.max(max, value) : max), 0);
    return `usr-${highest + 1}`;
  }
}
