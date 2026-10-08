import { Routes } from '@angular/router';

const productCategories = () =>
  import('./views/product-categories/product-categories').then(m => m.ProductCategories);

const productList = () =>
  import('./views/product-list/product-list').then(m => m.ProductList);

const productForm = () =>
  import('./views/product-form/product-form').then(m => m.ProductForm);

export const PRODUCTS_ROUTES: Routes = [
  { path: '',         loadComponent: productCategories, title: 'nav.products' },
  { path: 'list',     loadComponent: productList,       title: 'catalog.list.title' },
  { path: 'new',      loadComponent: productForm,       title: 'catalog.form.title' },
  { path: ':id/edit', loadComponent: productForm,       title: 'catalog.form.edit-title' }
];
