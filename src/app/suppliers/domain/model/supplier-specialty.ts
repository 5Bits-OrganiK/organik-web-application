/**
 * What a supplier is especially good at, used to recommend it against active alerts.
 *
 * - `urgent-restock`: can deliver on short notice to fix a stock shortage.
 * - `fresh-produce`: supplies perishable fresh products.
 * - `cold-chain`: guarantees a refrigerated chain for critical preservation.
 */
export type SupplierSpecialty = 'urgent-restock' | 'fresh-produce' | 'cold-chain';

/** Every specialty, in the order they are presented to the user. */
export const SUPPLIER_SPECIALTIES: readonly SupplierSpecialty[] = [
  'urgent-restock',
  'fresh-produce',
  'cold-chain'
];
