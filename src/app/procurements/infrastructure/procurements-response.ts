/**
 * Raw response contract for the shipment orders endpoint.
 */
export interface ShipmentOrdersResponse {
  shipments: ShipmentOrderResource[];
}

/**
 * Raw order line resource.
 */
export interface ShipmentLineResource {
  productId: string;
  quantity: number;
  lotCode: string;
  expiresOn: string;
}

/**
 * Raw decision resource.
 */
export interface OrderDecisionResource {
  decidedBy: string;
  decidedOn: string;
  reason: string;
}

/**
 * Raw shipment order resource exchanged with the backend.
 */
export interface ShipmentOrderResource {
  id: string;
  supplierId: string;
  minimarketId: string;
  lines: ShipmentLineResource[];
  createdOn: string;
  createdBy: string;
  status: string;
  decision?: OrderDecisionResource;
}
