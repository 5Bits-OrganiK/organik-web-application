import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {Quantity} from '../../../shared/domain/model/quantity';
import {ExpirationPolicy} from './expiration-policy';
import {StockStatus} from './stock-status';

/**
 * Data required to build a {@link StockLot}.
 */
export interface StockLotProps {
  lotCode: string;
  productId: string;
  quantity: Quantity;
  expiresOn: CalendarDate;
  location: string;
  notes: string;
}

/**
 * Represents a batch of one product received into the minimarket's inventory.
 */
export class StockLot {
  /** Code that identifies the lot, e.g. `LT-204`. */
  readonly lotCode: string;
  /** SKU of the product the lot contains. */
  readonly productId: string;
  readonly quantity: Quantity;
  readonly expiresOn: CalendarDate;
  /** Where the lot is stored, e.g. the cold room. */
  readonly location: string;
  readonly notes: string;

  /**
   * @throws DomainError if the lot code, product or location is blank.
   */
  constructor(props: StockLotProps) {
    for (const [field, value] of Object.entries({
      lotCode: props.lotCode,
      productId: props.productId,
      location: props.location
    })) {
      if (!value.trim()) {
        throw new DomainError(`Stock lot ${field} is required`);
      }
    }
    this.lotCode = props.lotCode.trim().toUpperCase();
    this.productId = props.productId;
    this.quantity = props.quantity;
    this.expiresOn = props.expiresOn;
    this.location = props.location.trim();
    this.notes = props.notes.trim();
  }

  /**
   * Returns the lot with other values for its editable data.
   *
   * @param changes - Fields to replace.
   * @throws DomainError if the result violates an invariant.
   */
  revise(changes: Partial<Pick<StockLotProps, 'quantity' | 'expiresOn' | 'location' | 'notes'>>): StockLot {
    return new StockLot({...this, ...changes});
  }

  /**
   * Returns the lot after discarding units, for example because they were lost.
   *
   * @param units - Units to discard.
   * @throws DomainError if the lot has fewer units than the ones to discard.
   */
  discard(units: Quantity): StockLot {
    if (units.value < 1 || units.isMoreThan(this.quantity)) {
      throw new DomainError(`Cannot discard ${units.value} units from lot ${this.lotCode} with ${this.quantity.value}`);
    }
    return this.revise({quantity: this.quantity.minus(units)});
  }

  /**
   * Whole days left before the lot expires.
   *
   * @param today - Reference day.
   */
  daysToExpire(today: CalendarDate): number {
    return today.daysUntil(this.expiresOn);
  }

  /**
   * Classifies the lot according to the expiration policy.
   *
   * @param today - Reference day.
   * @param policy - Policy that sets the thresholds.
   */
  statusOn(today: CalendarDate, policy: ExpirationPolicy): StockStatus {
    return policy.statusFor(this.daysToExpire(today));
  }
}
