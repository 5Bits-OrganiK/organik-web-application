import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {Quantity} from '../../../shared/domain/model/quantity';

/**
 * Data required to build an {@link OfferedProduct}.
 */
export interface OfferedProductProps {
  id: string;
  /** Supplier that offers the product. */
  supplierId: string;
  /** SKU of the product in the catalog of the minimarkets. */
  productId: string;
  /** Lot the offered units come from. */
  lotCode: string;
  /** Units the supplier can deliver right now. */
  availableQuantity: Quantity;
  /** Expiration day of the offered lot. */
  expiresOn: CalendarDate;
  /** Last day the supplier updated this entry. */
  updatedOn: CalendarDate;
}

/**
 * Represents a product a supplier offers to the minimarkets, with its lot and availability.
 * Offering a product never changes the inventory of any minimarket.
 */
export class OfferedProduct {
  readonly id: string;
  readonly supplierId: string;
  readonly productId: string;
  readonly lotCode: string;
  readonly availableQuantity: Quantity;
  readonly expiresOn: CalendarDate;
  readonly updatedOn: CalendarDate;

  /**
   * @throws DomainError if the identifier, the supplier, the product or the lot is blank.
   */
  constructor(props: OfferedProductProps) {
    for (const [field, value] of Object.entries({
      id: props.id,
      supplierId: props.supplierId,
      productId: props.productId,
      lotCode: props.lotCode
    })) {
      if (!value.trim()) {
        throw new DomainError(`Offered product ${field} is required`);
      }
    }
    this.id = props.id;
    this.supplierId = props.supplierId;
    this.productId = props.productId;
    this.lotCode = props.lotCode.trim().toUpperCase();
    this.availableQuantity = props.availableQuantity;
    this.expiresOn = props.expiresOn;
    this.updatedOn = props.updatedOn;
  }

  /**
   * Whether the supplier has enough units to deliver a quantity.
   *
   * @param quantity - Units requested.
   */
  canSupply(quantity: Quantity): boolean {
    return !quantity.isMoreThan(this.availableQuantity);
  }

  /**
   * Returns the entry with an updated lot, availability and expiration.
   *
   * @param changes - New values.
   * @param today - Day of the update.
   * @throws DomainError if the result violates an invariant.
   */
  update(changes: Partial<Pick<OfferedProductProps, 'lotCode' | 'availableQuantity' | 'expiresOn'>>, today: CalendarDate): OfferedProduct {
    return new OfferedProduct({...this, ...changes, updatedOn: today});
  }

  /**
   * Whether the entry belongs to a supplier.
   *
   * @param supplierId - Supplier to check.
   */
  belongsTo(supplierId: string | null): boolean {
    return supplierId !== null && this.supplierId === supplierId;
  }
}
