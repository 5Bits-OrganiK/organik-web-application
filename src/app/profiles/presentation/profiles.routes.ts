import { Routes } from '@angular/router';

const profileList = () =>
  import('./views/profile-list/profile-list').then(m => m.ProfileList);

export const PROFILES_ROUTES: Routes = [
  { path: '', loadComponent: profileList, title: 'nav.profiles' }
];
