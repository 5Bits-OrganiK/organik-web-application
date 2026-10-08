/**
 * Raw response contract for the suppliers endpoint.
 */
export interface SuppliersResponse {
  /** Collection of raw supplier resources. */
  suppliers: SupplierResource[];
}

/**
 * Raw supplier resource exchanged with the backend.
 */
export interface SupplierResource {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  categories: string[];
  organicCertification: string;
  specialties: string[];
}

/**
 * Raw response contract for the offered products endpoint.
 */
export interface OfferedProductsResponse {
  offeredProducts: OfferedProductResource[];
}

/**
 * Raw offered product resource exchanged with the backend.
 */
export interface OfferedProductResource {
  id: string;
  supplierId: string;
  productId: string;
  lotCode: string;
  availableQuantity: number;
  /** Expiration day in ISO-8601 format (`yyyy-MM-dd`). */
  expiresOn: string;
  /** Last update day in ISO-8601 format (`yyyy-MM-dd`). */
  updatedOn: string;
}
