import {inject, Injectable} from '@angular/core';
import {defer, map, Observable, switchMap, throwError} from 'rxjs';
import {FakeApi} from '../../shared/infrastructure/fake-api';
import {respondWith} from '../../shared/infrastructure/in-memory-gateway';
import {AuthenticationError} from '../domain/model/authentication-error';
import {Registration} from '../domain/model/registration';
import {RegistrationError} from '../domain/model/registration-error';
import {User} from '../domain/model/user.entity';
import {DEMO_ACCOUNTS, DEMO_PASSWORD} from './credentials-seed';
import {UserResource} from './iam-response';
import {USERS_SEED} from './iam-seed';
import {UserAssembler} from './user-assembler';

/** Browser storage key where the accounts created on this device are kept. */
const ACCOUNTS_KEY = 'organik.accounts';

/** User object as the fake API stores it: the user resource plus the password. */
type RemoteUser = UserResource & {password?: string};

/** An account created through the registration screen. */
interface StoredAccount {
  resource: UserResource;
  password: string;
}

@Injectable({providedIn: 'root'})
/**
 * Infrastructure gateway to the identity and access backend.
 *
 * @remarks
 * Until the backend exists, resources are kept in memory and the accounts created through the
 * registration screen are stored in the fake API (`/users`) and remembered in this browser
 * (`localStorage`), so they survive a reload even when the fake API is unavailable. A real backend
 * replaces this and never keeps passwords in the browser or returns them to it.
 * The gateway still returns domain entities by delegating resource mapping to the assembler.
 */
export class IamApi {
  private readonly assembler = inject(UserAssembler);
  private readonly fakeApi = inject(FakeApi);
  private readonly resources: UserResource[] = structuredClone(USERS_SEED);
  private readonly passwords = new Map<string, string>(DEMO_ACCOUNTS.map(email => [email, DEMO_PASSWORD]));

  constructor() {
    for (const account of this.readAccounts()) {
      this.resources.push(account.resource);
      this.passwords.set(account.resource.email, account.password);
    }
  }

  /**
   * Fetches every user.
   */
  getUsers(): Observable<User[]> {
    return this.syncRemoteAccounts().pipe(
      switchMap(() => respondWith({users: structuredClone(this.resources)})),
      map(response => this.assembler.toEntitiesFromResponse(response))
    );
  }

  /**
   * Persists a new user.
   *
   * @param user - User entity to store.
   */
  createUser(user: User): Observable<User> {
    this.resources.push(this.assembler.toResourceFromEntity(user));
    return respondWith(user);
  }

  /**
   * Replaces the stored version of a user.
   *
   * @param user - Updated user entity.
   */
  updateUser(user: User): Observable<User> {
    const index = this.resources.findIndex(resource => resource.id === user.id);
    this.resources[index] = this.assembler.toResourceFromEntity(user);
    return respondWith(user);
  }

  /**
   * Checks the credentials of a user.
   *
   * @param email - E-mail typed by the user.
   * @param password - Password typed by the user.
   * @returns The user when the credentials are right; otherwise it fails with an AuthenticationError.
   */
  authenticate(email: string, password: string): Observable<User> {
    return defer(() => this.syncRemoteAccounts()).pipe(
      switchMap(() => {
        const normalized = email.trim().toLowerCase();
        const resource = this.resources.find(candidate => candidate.email === normalized);
        if (!resource || password !== this.passwords.get(normalized)) {
          return throwError(() => new AuthenticationError('invalid-credentials'));
        }
        return respondWith(resource).pipe(
          switchMap(found =>
            found.status === 'pending'
              ? throwError(() => new AuthenticationError('pending-invitation'))
              : respondWith(this.assembler.toEntityFromResource(found))
          )
        );
      })
    );
  }

  /**
   * Creates the account of a new minimarket administrator or supplier.
   *
   * @param registration - Data typed on the registration screen.
   * @returns The new user; otherwise it fails with a RegistrationError when the e-mail is already used.
   */
  register(registration: Registration): Observable<User> {
    return defer(() => this.syncRemoteAccounts()).pipe(
      switchMap(() => {
      const email = registration.email.trim().toLowerCase();
      if (this.resources.some(candidate => candidate.email === email)) {
        return throwError(() => new RegistrationError('email-taken'));
      }
      const id = this.nextUserId();
      const resource: UserResource = {
        id,
        fullName: registration.fullName.trim(),
        email,
        role: registration.role,
        assignedModule: registration.role === 'supplier' ? 'requests' : 'dashboard',
        status: 'accepted',
        notes: registration.company.trim(),
        minimarketId: registration.role === 'supplier' ? '' : `mm-${id}`,
        supplierId: registration.role === 'supplier' ? `sup-${id}` : null,
        plan: registration.plan ?? ''
      };
      const user = this.assembler.toEntityFromResource(resource);
      this.resources.push(resource);
      this.passwords.set(email, registration.password);
      this.saveAccount({resource, password: registration.password});
      return this.fakeApi
        .create('users', {...resource, password: registration.password})
        .pipe(switchMap(() => respondWith(user)));
      })
    );
  }

  /**
   * Sends the invitation e-mail to a user again.
   *
   * @param user - User who should receive the invitation.
   */
  resendInvitation(user: User): Observable<User> {
    return respondWith(user);
  }

  /** Adds to the local data the accounts the fake API holds (for example those registered on another device). */
  private syncRemoteAccounts(): Observable<void> {
    return this.fakeApi.list<RemoteUser>('users').pipe(
      map(remote => {
        for (const {password, ...resource} of remote ?? []) {
          const email = resource.email?.trim().toLowerCase();
          if (!email || !password) {
            continue;
          }
          if (!this.resources.some(candidate => candidate.email === email)) {
            this.resources.push({...resource, email});
          }
          this.passwords.set(email, password);
        }
      })
    );
  }

  private nextUserId(): string {
    const highest = this.resources.reduce((max, {id}) => Math.max(max, Number(id.replace('usr-', '')) || 0), 0);
    return `usr-${highest + 1}`;
  }

  private readAccounts(): StoredAccount[] {
    try {
      const stored: unknown = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? '[]');
      return Array.isArray(stored) ? (stored as StoredAccount[]) : [];
    } catch {
      return [];
    }
  }

  private saveAccount(account: StoredAccount): void {
    try {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...this.readAccounts(), account]));
    } catch {
      // Storage can be unavailable (private mode); the account then lasts until the page is reloaded.
    }
  }
}
