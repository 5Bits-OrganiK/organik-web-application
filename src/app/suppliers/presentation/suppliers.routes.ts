import { Routes } from '@angular/router';

const supplierList = () =>
  import('./views/supplier-list/supplier-list').then(m => m.SupplierList);

const supplierForm = () =>
  import('./views/supplier-form/supplier-form').then(m => m.SupplierForm);

const suggestedSuppliers = () =>
  import('./views/suggested-suppliers/suggested-suppliers').then(m => m.SuggestedSuppliers);

const supplierDetail = () =>
  import('./views/supplier-detail/supplier-detail').then(m => m.SupplierDetail);

export const SUPPLIERS_ROUTES: Routes = [
  { path: '',          loadComponent: supplierList,       title: 'nav.suppliers' },
  { path: 'new',       loadComponent: supplierForm,       title: 'suppliers.form.title' },
  { path: 'suggested', loadComponent: suggestedSuppliers, title: 'suppliers.suggested.title' },
  { path: ':id',       loadComponent: supplierDetail,     title: 'suppliers.detail.title' }
];
