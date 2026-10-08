/**
 * Raw response contract for the stock lots endpoint.
 */
export interface StockLotsResponse {
  lots: StockLotResource[];
}

/**
 * Raw stock lot resource exchanged with the backend.
 */
export interface StockLotResource {
  lotCode: string;
  productId: string;
  quantity: number;
  /** Expiration day in ISO-8601 format (`yyyy-MM-dd`). */
  expiresOn: string;
  location: string;
  notes: string;
}

/**
 * Raw response contract for the inventory events endpoint.
 */
export interface InventoryEventsResponse {
  events: InventoryEventResource[];
}

/**
 * Raw inventory event resource exchanged with the backend.
 */
export interface InventoryEventResource {
  id: string;
  type: string;
  productId: string;
  lotCode: string | null;
  quantity: number | null;
  cause: string;
  detail: string;
  actorName: string;
  /** Day of the event in ISO-8601 format (`yyyy-MM-dd`). */
  occurredOn: string;
}

/**
 * Raw response contract for the offers endpoint.
 */
export interface OffersResponse {
  offers: OfferResource[];
}

/**
 * Raw offer resource exchanged with the backend.
 */
export interface OfferResource {
  id: string;
  productId: string;
  quantity: number;
  validUntil: string;
  createdBy: string;
  createdOn: string;
}
