/** Accent used to tell categories apart in the catalog. */
export type CategoryTone = 'green' | 'blue' | 'orange' | 'yellow' | 'neutral';

/**
 * Represents a product category of the minimarket catalog.
 */
export class ProductCategory {
  /**
   * @param id - Stable identifier; also the suffix of its translation key.
   * @param tone - Accent shown in the catalog.
   */
  constructor(
    readonly id: string,
    readonly tone: CategoryTone
  ) {}
}
