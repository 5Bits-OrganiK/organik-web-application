import {CategoryResource, ProductResource} from './products-response';

/**
 * Product categories of the minimarket while the backend is not available.
 */
export const CATEGORIES_SEED: CategoryResource[] = [
  {id: 'fruits-vegetables', tone: 'green'},
  {id: 'dairy', tone: 'blue'},
  {id: 'grains', tone: 'orange'},
  {id: 'beverages', tone: 'yellow'},
  {id: 'bakery', tone: 'neutral'},
  {id: 'frozen', tone: 'neutral'}
];

/**
 * Products of the minimarket while the backend is not available.
 */
export const PRODUCTS_SEED: ProductResource[] = [
  {id: 'ORG-01', name: 'Yogurt orgánico', categoryId: 'dairy', supplierId: 'sup-anita-gamboa', unit: 'unit', minimumStock: 60, storageCondition: 'cold'},
  {id: 'ORG-02', name: 'Lechuga hidropónica', categoryId: 'fruits-vegetables', supplierId: 'sup-valle-verde', unit: 'unit', minimumStock: 40, storageCondition: 'fresh'},
  {id: 'ORG-03', name: 'Quinua real', categoryId: 'grains', supplierId: 'sup-valle-verde', unit: 'kg', minimumStock: 120, storageCondition: 'dry'},
  {id: 'ORG-04', name: 'Tomate orgánico', categoryId: 'fruits-vegetables', supplierId: 'sup-bioandes', unit: 'kg', minimumStock: 80, storageCondition: 'fresh'},
  {id: 'ORG-05', name: 'Leche orgánica', categoryId: 'dairy', supplierId: 'sup-anita-gamboa', unit: 'liter', minimumStock: 100, storageCondition: 'cold'},
  {id: 'ORG-06', name: 'Queso orgánico', categoryId: 'dairy', supplierId: 'sup-ecolacteos', unit: 'kg', minimumStock: 50, storageCondition: 'cold'},
  {id: 'ORG-07', name: 'Brócoli orgánico', categoryId: 'fruits-vegetables', supplierId: 'sup-bioandes', unit: 'kg', minimumStock: 40, storageCondition: 'fresh'}
];
