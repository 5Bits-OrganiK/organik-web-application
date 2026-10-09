import { Routes } from '@angular/router';
import { authGuard, guestGuard, moduleGuard } from './iam/presentation/guards/auth.guard';

const layout = () =>
  import('./shared/presentation/components/layout/layout').then(m => m.Layout);

const login = () =>
  import('./iam/presentation/views/login/login').then(m => m.Login);

const register = () =>
  import('./iam/presentation/views/register/register').then(m => m.Register);

const prototypeFlow = () =>
  import('./shared/presentation/views/prototype-flow/prototype-flow').then(m => m.PrototypeFlow);

const suppliers = () =>
  import('./suppliers/presentation/suppliers.routes').then(m => m.SUPPLIERS_ROUTES);

const catalog = () =>
  import('./suppliers/presentation/catalog.routes').then(m => m.CATALOG_ROUTES);

const products = () =>
  import('./products/presentation/products.routes').then(m => m.PRODUCTS_ROUTES);

const inventory = () =>
  import('./inventory/presentation/inventory.routes').then(m => m.INVENTORY_ROUTES);

const requests = () =>
  import('./requisition/presentation/requests.routes').then(m => m.REQUESTS_ROUTES);

const shipments = () =>
  import('./procurements/presentation/shipments.routes').then(m => m.SHIPMENTS_ROUTES);

const conservation = () =>
  import('./conservation/presentation/conservation.routes').then(m => m.CONSERVATION_ROUTES);

const analytics = () =>
  import('./analytics/presentation/analytics.routes').then(m => m.ANALYTICS_ROUTES);

const alerts = () =>
  import('./communication/presentation/alerts.routes').then(m => m.ALERTS_ROUTES);

const dashboard = () =>
  import('./dashboard/presentation/dashboard.routes').then(m => m.DASHBOARD_ROUTES);

const users = () =>
  import('./iam/presentation/users.routes').then(m => m.USERS_ROUTES);

const profiles = () =>
  import('./profiles/presentation/profiles.routes').then(m => m.PROFILES_ROUTES);

const settings = () =>
  import('./profiles/presentation/settings.routes').then(m => m.SETTINGS_ROUTES);

const pageNotFound = () =>
  import('./shared/presentation/views/page-not-found/page-not-found').then(m => m.PageNotFound);

export const routes: Routes = [
  { path: '',          pathMatch: 'full', redirectTo: 'dashboard' },
  { path: 'login',     loadComponent: login,         canActivate: [guestGuard], title: 'auth.page-title' },
  { path: 'register',  loadComponent: register,      canActivate: [guestGuard], title: 'auth.register-page-title' },
  { path: 'prototype', loadComponent: prototypeFlow, title: 'flow.page-title' },
  {
    path: '',
    loadComponent: layout,
    canActivate: [authGuard],
    canActivateChild: [moduleGuard],
    children: [
      { path: 'settings', loadChildren: settings },
      { path: 'profiles', loadChildren: profiles },
      { path: 'users', loadChildren: users },
      { path: 'dashboard', loadChildren: dashboard },
      { path: 'alerts', loadChildren: alerts },
      { path: 'analytics', loadChildren: analytics },
      { path: 'conservation', loadChildren: conservation },
      { path: 'shipments', loadChildren: shipments },
      { path: 'requests', loadChildren: requests },
      { path: 'inventory', loadChildren: inventory },
      { path: 'products', loadChildren: products },
      { path: 'suppliers', loadChildren: suppliers },
      { path: 'catalog', loadChildren: catalog },
      { path: '**', loadComponent: pageNotFound, title: 'page-not-found.page-title' }
    ]
  }
];
