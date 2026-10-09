import { Routes } from '@angular/router';

const userList = () =>
  import('./views/user-list/user-list').then(m => m.UserList);

const userForm = () =>
  import('./views/user-form/user-form').then(m => m.UserForm);

export const USERS_ROUTES: Routes = [
  { path: '',         loadComponent: userList, title: 'nav.users' },
  { path: 'new',      loadComponent: userForm, title: 'iam.users.form.title' },
  { path: ':id/edit', loadComponent: userForm, title: 'iam.users.form.edit-title' }
];
