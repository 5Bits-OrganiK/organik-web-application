import {computed, inject, Injectable} from '@angular/core';
import {MODULE_KEYS, ModuleKey} from '../domain/model/role';
import {AuthStore} from './auth.store';
import {UsersStore} from './users.store';

@Injectable({providedIn: 'root'})
/**
 * Application service that exposes who is using the application.
 */
export class SessionStore {
  private readonly auth = inject(AuthStore);
  private readonly users = inject(UsersStore);

  /** The signed-in user, or `undefined` while the users load or nobody is signed in. */
  readonly currentUser = computed(() => {
    const id = this.auth.userId();
    return id ? this.users.findById(id) : undefined;
  });

  /** Translation key that describes the role of the signed-in user. */
  readonly roleKey = computed(() => `iam.session.${this.currentUser()?.role.id ?? 'administrator'}`);

  /**
   * Whether the signed-in user can open the module behind a router link such as `/inventory`.
   * Links that are not modules (like the profiles) are always allowed, and so is everything
   * while the user is still loading.
   *
   * @param link - Router path of the module.
   */
  canOpen(link: string): boolean {
    const user = this.currentUser();
    const module = link.replace(/^\//, '').split(/[/?#]/)[0] as ModuleKey;
    return !user || !MODULE_KEYS.includes(module) || user.role.accessTo(module) !== 'none';
  }

  /**
   * Whether the signed-in user can create and change things in a module (not just see it).
   *
   * @param link - Router path of the module, e.g. `/requests`.
   */
  canManage(link: string): boolean {
    const user = this.currentUser();
    const module = link.replace(/^\//, '').split(/[/?#]/)[0] as ModuleKey;
    return !!user && MODULE_KEYS.includes(module) && user.role.accessTo(module) === 'manage';
  }

  /**
   * Loads the data of the signed-in user.
   */
  loadSession(): void {
    this.users.loadUsers();
  }
}
