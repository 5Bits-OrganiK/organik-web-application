import { Routes } from '@angular/router';
import { manageGuard } from '../../iam/presentation/guards/auth.guard';

const catalogList = () =>
  import('./views/catalog-list/catalog-list').then(m => m.CatalogList);

const offeringForm = () =>
  import('./views/offering-form/offering-form').then(m => m.OfferingForm);

export const CATALOG_ROUTES: Routes = [
  { path: '',         loadComponent: catalogList,  title: 'nav.catalog' },
  { path: 'new',      loadComponent: offeringForm, canActivate: [manageGuard('catalog')], title: 'catalog-page.form.title' },
  { path: ':id/edit', loadComponent: offeringForm, canActivate: [manageGuard('catalog')], title: 'catalog-page.form.edit-title' }
];
