import {DomainError} from '../../../shared/domain/model/domain-error';
import {Quantity} from '../../../shared/domain/model/quantity';
import {StorageCondition} from '../../../shared/domain/model/storage-condition';
import {MeasurementUnit} from './measurement-unit';

/**
 * Data required to build a {@link Product}.
 */
export interface ProductProps {
  id: string;
  name: string;
  categoryId: string;
  supplierId: string;
  unit: MeasurementUnit;
  minimumStock: Quantity;
  storageCondition: StorageCondition;
}

/**
 * Represents a product of the minimarket catalog.
 */
export class Product {
  /** SKU that identifies the product, e.g. `ORG-01`. */
  readonly id: string;
  readonly name: string;
  readonly categoryId: string;
  /** Supplier that usually provides the product. */
  readonly supplierId: string;
  readonly unit: MeasurementUnit;
  /** Stock under which the product needs to be replenished. */
  readonly minimumStock: Quantity;
  readonly storageCondition: StorageCondition;

  /**
   * @throws DomainError if the SKU, name, category or supplier is blank.
   */
  constructor(props: ProductProps) {
    for (const [field, value] of Object.entries({
      id: props.id,
      name: props.name,
      categoryId: props.categoryId,
      supplierId: props.supplierId
    })) {
      if (!value.trim()) {
        throw new DomainError(`Product ${field} is required`);
      }
    }
    this.id = props.id;
    this.name = props.name.trim();
    this.categoryId = props.categoryId;
    this.supplierId = props.supplierId;
    this.unit = props.unit;
    this.minimumStock = props.minimumStock;
    this.storageCondition = props.storageCondition;
  }

  /**
   * Returns the product with other values for its editable data.
   *
   * @param changes - Fields to replace.
   * @throws DomainError if the result violates an invariant.
   */
  revise(changes: Partial<Omit<ProductProps, 'id'>>): Product {
    return new Product({...this, ...changes});
  }

  /**
   * Whether the given stock is under the minimum the product has to keep.
   *
   * @param stock - Units currently available.
   */
  isBelowMinimum(stock: Quantity): boolean {
    return stock.isLessThan(this.minimumStock);
  }
}
