/**
 * How a product has to be kept to preserve its quality.
 *
 * @remarks
 * Shared across bounded contexts: the catalog declares it per product and the
 * conservation context monitors it per storage zone.
 */
export type StorageCondition = 'cold' | 'fresh' | 'dry' | 'frozen';

/** Every storage condition, from the coldest to the driest. */
export const STORAGE_CONDITIONS: readonly StorageCondition[] = ['cold', 'fresh', 'dry', 'frozen'];
