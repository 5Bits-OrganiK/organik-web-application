import {computed, inject, Injectable, signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {Registration} from '../domain/model/registration';
import {User} from '../domain/model/user.entity';
import {IamApi} from '../infrastructure/iam-api';
import {UsersStore} from './users.store';

const STORAGE_KEY = 'organik.session';

@Injectable({providedIn: 'root'})
/**
 * Application service that signs users in and out and remembers who is signed in.
 *
 * @remarks
 * The session lives in `sessionStorage`, so it ends when the browser tab is closed.
 */
export class AuthStore {
  private readonly api = inject(IamApi);
  private readonly users = inject(UsersStore);

  private readonly userIdSignal = signal<string | null>(this.read());

  /** Identifier of the signed-in user, or `null` when nobody is signed in. */
  readonly userId = this.userIdSignal.asReadonly();

  /** Whether somebody is signed in. */
  readonly isAuthenticated = computed(() => this.userIdSignal() !== null);

  /**
   * Signs a user in.
   *
   * @param email - E-mail of the user.
   * @param password - Password of the user.
   * @returns The signed-in user.
   * @throws AuthenticationError (through the observable) if the credentials are refused.
   */
  login(email: string, password: string): Observable<User> {
    return this.api.authenticate(email, password).pipe(
      tap(user => {
        this.userIdSignal.set(user.id);
        this.write(user.id);
      })
    );
  }

  /**
   * Creates an account (minimarket administrator or supplier) and signs its owner in.
   *
   * @param registration - Data typed on the registration screen.
   * @returns The new, signed-in user.
   * @throws RegistrationError (through the observable) if the e-mail already has an account.
   */
  register(registration: Registration): Observable<User> {
    return this.api.register(registration).pipe(
      tap(user => {
        this.users.append(user);
        this.userIdSignal.set(user.id);
        this.write(user.id);
      })
    );
  }

  /**
   * Ends the session.
   */
  logout(): void {
    this.userIdSignal.set(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Storage can be unavailable; the in-memory session is already closed.
    }
  }

  private read(): string | null {
    try {
      return sessionStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  private write(userId: string): void {
    try {
      sessionStorage.setItem(STORAGE_KEY, userId);
    } catch {
      // Storage can be unavailable (private mode); the session then only lasts while the app stays open.
    }
  }
}
