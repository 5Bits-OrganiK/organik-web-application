import { Routes } from '@angular/router';

const analyticsOverview = () =>
  import('./views/analytics-overview/analytics-overview').then(m => m.AnalyticsOverview);

const reportForm = () =>
  import('./views/report-form/report-form').then(m => m.ReportForm);

export const ANALYTICS_ROUTES: Routes = [
  { path: '',       loadComponent: analyticsOverview, title: 'nav.analytics' },
  { path: 'report', loadComponent: reportForm,        title: 'reports.form.title' }
];
