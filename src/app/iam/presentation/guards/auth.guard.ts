import {inject} from '@angular/core';
import {CanActivateChildFn, CanActivateFn, Router} from '@angular/router';
import {map} from 'rxjs';
import {AuthStore} from '../../application/auth.store';
import {MODULE_KEYS, ModuleKey} from '../../domain/model/role';
import {User} from '../../domain/model/user.entity';
import {IamApi} from '../../infrastructure/iam-api';

/**
 * Lets only signed-in users in; everybody else is sent to the login and brought back afterwards.
 */
export const authGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  return inject(AuthStore).isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], {queryParams: {returnUrl: state.url}});
};

/**
 * Keeps signed-in users away from the login screen.
 */
export const guestGuard: CanActivateFn = () => {
  const router = inject(Router);
  return inject(AuthStore).isAuthenticated() ? router.createUrlTree(['/dashboard']) : true;
};

/**
 * Keeps a signed-in user inside the modules their role can open; anything else goes to the dashboard.
 */
export const moduleGuard: CanActivateChildFn = (_route, state) => {
  const router = inject(Router);
  const auth = inject(AuthStore);
  const module = state.url.replace(/^\//, '').split(/[/?#]/)[0] as ModuleKey;
  const verdict = (user: User | undefined) =>
    !user || !MODULE_KEYS.includes(module) || user.role.accessTo(module) !== 'none' ? true : router.createUrlTree(['/dashboard']);
  // The users may not be loaded yet (for example after a reload), so they are read from the gateway.
  return inject(IamApi).getUsers().pipe(map(users => verdict(users.find(user => user.id === auth.userId()))));
};

/**
 * Creates a guard that lets only the roles that can manage a module open a form of that module;
 * the others are sent back to the module list.
 *
 * @param module - Module whose forms are protected.
 */
export const manageGuard = (module: ModuleKey): CanActivateFn => () => {
  const router = inject(Router);
  const auth = inject(AuthStore);
  return inject(IamApi).getUsers().pipe(
    map(users => {
      const user = users.find(candidate => candidate.id === auth.userId());
      return !user || user.role.accessTo(module) === 'manage' ? true : router.createUrlTree([`/${module}`]);
    })
  );
};
