/**
 * How a sensor reading compares with the range of its storage zone.
 *
 * - `normal`: inside the range.
 * - `warning`: slightly outside the range; the zone needs attention.
 * - `critical`: far outside the range; the products are at risk.
 */
export type ReadingStatus = 'normal' | 'warning' | 'critical';
