import { Routes } from '@angular/router';

const inventoryList = () =>
  import('./views/inventory-list/inventory-list').then(m => m.InventoryList);

const stockForm = () =>
  import('./views/stock-form/stock-form').then(m => m.StockForm);

const productLots = () =>
  import('./views/product-lots/product-lots').then(m => m.ProductLots);

const lotForm = () =>
  import('./views/lot-form/lot-form').then(m => m.LotForm);

const wasteForm = () =>
  import('./views/waste-form/waste-form').then(m => m.WasteForm);

const offerForm = () =>
  import('./views/offer-form/offer-form').then(m => m.OfferForm);

const inventoryHistory = () =>
  import('./views/inventory-history/inventory-history').then(m => m.InventoryHistory);

export const INVENTORY_ROUTES: Routes = [
  { path: '',                    loadComponent: inventoryList,    title: 'nav.inventory' },
  { path: 'stock/new',           loadComponent: stockForm,        title: 'inventory.form.title' },
  { path: 'product/:productId',  loadComponent: productLots,      title: 'inventory.product.title' },
  { path: 'lots/:lotCode/edit',  loadComponent: lotForm,          title: 'inventory.lot-form.title' },
  { path: 'waste/new',           loadComponent: wasteForm,        title: 'inventory.waste-form.title' },
  { path: 'offers/new',          loadComponent: offerForm,        title: 'inventory.offer-form.title' },
  { path: 'history',             loadComponent: inventoryHistory, title: 'inventory.history.title' }
];
