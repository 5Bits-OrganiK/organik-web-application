/**
 * What an alert warns about.
 *
 * - `expiration`: lots that are about to expire.
 * - `temperature`: storage zones outside their temperature or humidity range.
 * - `minimum-stock`: products whose stock reached the minimum.
 */
export type AlertType = 'expiration' | 'temperature' | 'minimum-stock';

/** How urgent an alert is. */
export type AlertSeverity = 'info' | 'critical';

/**
 * An active alert about the conservation of the minimarket's products.
 */
export class ConservationAlert {
  /**
   * @param type - What the alert warns about.
   * @param severity - How urgent it is.
   * @param subjects - Names of the products or zones that triggered it.
   */
  constructor(
    readonly type: AlertType,
    readonly severity: AlertSeverity,
    readonly subjects: readonly string[]
  ) {}
}
