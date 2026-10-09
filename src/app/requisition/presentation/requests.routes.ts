import { Routes } from '@angular/router';
import { manageGuard } from '../../iam/presentation/guards/auth.guard';

const requestList = () =>
  import('./views/request-list/request-list').then(m => m.RequestList);

const requestForm = () =>
  import('./views/request-form/request-form').then(m => m.RequestForm);

export const REQUESTS_ROUTES: Routes = [
  { path: '',    loadComponent: requestList, title: 'nav.requests' },
  { path: 'new', loadComponent: requestForm, canActivate: [manageGuard('requests')], title: 'requests.form.title' }
];
