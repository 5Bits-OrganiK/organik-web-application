/**
 * Raw response contract for the operational indicators endpoint.
 */
export interface IndicatorsResource {
  /** Money saved by acting on alerts, in soles. */
  avoidedLoss: number;
  productsAtRisk: number;
  /** Share of accepted requests, 0–100. */
  acceptedRequestsRate: number;
  /** Operational health, 0–100. */
  operationalHealth: number;
}

/**
 * Raw response contract for the alert trend endpoint.
 */
export interface AlertTrendResponse {
  points: AlertTrendPointResource[];
}

/**
 * Raw alert trend point exchanged with the backend.
 */
export interface AlertTrendPointResource {
  label: string;
  count: number;
}
