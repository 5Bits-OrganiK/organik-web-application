import { Routes } from '@angular/router';

const alertsOverview = () =>
  import('./views/alerts-overview/alerts-overview').then(m => m.AlertsOverview);

export const ALERTS_ROUTES: Routes = [
  { path: '', loadComponent: alertsOverview, title: 'analytics.alerts-title' }
];
