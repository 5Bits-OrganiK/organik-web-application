import { Routes } from '@angular/router';

const settings = () =>
  import('./views/settings/settings').then(m => m.Settings);

export const SETTINGS_ROUTES: Routes = [
  { path: '', loadComponent: settings, title: 'nav.settings' }
];
