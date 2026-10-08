/**
 * Health of a stock lot with respect to its expiration date.
 *
 * - `normal`: enough shelf life left.
 * - `risk`: close to expiring; it should be sold or promoted soon.
 * - `critical`: about to expire or already expired.
 */
export type StockStatus = 'normal' | 'risk' | 'critical';

/** Every stock status, from the healthiest to the most urgent. */
export const STOCK_STATUSES: readonly StockStatus[] = ['normal', 'risk', 'critical'];
