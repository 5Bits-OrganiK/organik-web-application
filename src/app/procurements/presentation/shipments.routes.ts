import { Routes } from '@angular/router';

const shipmentList = () =>
  import('./views/shipment-list/shipment-list').then(m => m.ShipmentList);

const orderForm = () =>
  import('./views/order-form/order-form').then(m => m.OrderForm);

const orderDetail = () =>
  import('./views/order-detail/order-detail').then(m => m.OrderDetail);

export const SHIPMENTS_ROUTES: Routes = [
  { path: '',    loadComponent: shipmentList, title: 'nav.shipments' },
  { path: 'new', loadComponent: orderForm,    title: 'shipments.form.title' },
  { path: ':id', loadComponent: orderDetail,  title: 'shipments.detail.title' }
];
