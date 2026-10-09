import { Routes } from '@angular/router';

const conservationMonitoring = () =>
  import('./views/conservation-monitoring/conservation-monitoring').then(m => m.ConservationMonitoring);

const conservationAlerts = () =>
  import('./views/conservation-alerts/conservation-alerts').then(m => m.ConservationAlerts);

export const CONSERVATION_ROUTES: Routes = [
  { path: '',       loadComponent: conservationMonitoring, title: 'nav.conservation' },
  { path: 'alerts', loadComponent: conservationAlerts,     title: 'conservation.alerts.title' }
];
