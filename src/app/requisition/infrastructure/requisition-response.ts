/**
 * Raw response contract for the supply requests endpoint.
 */
export interface SupplyRequestsResponse {
  requests: SupplyRequestResource[];
}

/**
 * Raw supply request resource exchanged with the backend.
 */
export interface SupplyRequestResource {
  id: string;
  productId: string;
  supplierId: string;
  minimarketId: string;
  quantity: number;
  reason: string;
  /** Required day in ISO-8601 format (`yyyy-MM-dd`). */
  requiredOn: string;
  priority: string;
  status: string;
}
