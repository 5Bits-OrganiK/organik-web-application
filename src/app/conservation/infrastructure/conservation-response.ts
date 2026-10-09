/**
 * Raw response contract for the storage zones endpoint.
 */
export interface StorageZonesResponse {
  zones: StorageZoneResource[];
}

/**
 * Raw response contract for the storage readings endpoint.
 */
export interface StorageReadingsResponse {
  readings: StorageReadingResource[];
}

/**
 * Raw storage zone resource exchanged with the backend.
 */
export interface StorageZoneResource {
  id: string;
  name: string;
  condition: string;
}

/**
 * Raw sensor reading resource exchanged with the backend.
 */
export interface StorageReadingResource {
  zoneId: string;
  productId: string;
  temperature: number;
  humidity: number;
  /** Local moment of the measurement, e.g. `2026-09-18T09:30:00`. */
  recordedAt: string;
  /** `simulated` or `sensor`. */
  source: string;
}
