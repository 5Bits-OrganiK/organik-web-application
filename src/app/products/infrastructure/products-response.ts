/**
 * Raw response contract for the categories endpoint.
 */
export interface CategoriesResponse {
  categories: CategoryResource[];
}

/**
 * Raw response contract for the products endpoint.
 */
export interface ProductsResponse {
  products: ProductResource[];
}

/**
 * Raw category resource exchanged with the backend.
 */
export interface CategoryResource {
  id: string;
  tone: string;
}

/**
 * Raw product resource exchanged with the backend.
 */
export interface ProductResource {
  id: string;
  name: string;
  categoryId: string;
  supplierId: string;
  unit: string;
  minimumStock: number;
  storageCondition: string;
}
