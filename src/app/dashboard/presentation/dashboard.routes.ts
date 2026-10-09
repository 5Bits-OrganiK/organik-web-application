import { Routes } from '@angular/router';

const dashboard = () =>
  import('./views/dashboard/dashboard').then(m => m.Dashboard);

export const DASHBOARD_ROUTES: Routes = [
  { path: '', loadComponent: dashboard, title: 'nav.dashboard' }
];
