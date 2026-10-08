import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {Quantity} from '../../../shared/domain/model/quantity';

/**
 * Data required to build an {@link Offer}.
 */
export interface OfferProps {
  id: string;
  productId: string;
  quantity: Quantity;
  validUntil: CalendarDate;
  createdBy: string;
  createdOn: CalendarDate;
}

/**
 * Represents units of a product put on offer for a period. An offer never discounts the stock by
 * itself: it only keeps track of what was promoted and until when.
 */
export class Offer {
  readonly id: string;
  readonly productId: string;
  readonly quantity: Quantity;
  readonly validUntil: CalendarDate;
  readonly createdBy: string;
  readonly createdOn: CalendarDate;

  /**
   * @throws DomainError if the offer has no units or it expires before it is created.
   */
  constructor(props: OfferProps) {
    if (!props.id.trim() || !props.productId.trim()) {
      throw new DomainError('An offer needs an identifier and a product');
    }
    if (props.quantity.value < 1) {
      throw new DomainError('An offer needs at least one unit');
    }
    if (props.validUntil.isBefore(props.createdOn)) {
      throw new DomainError('An offer cannot expire before it is created');
    }
    this.id = props.id;
    this.productId = props.productId;
    this.quantity = props.quantity;
    this.validUntil = props.validUntil;
    this.createdBy = props.createdBy;
    this.createdOn = props.createdOn;
  }

  /**
   * Whether the offer is still valid.
   *
   * @param today - Reference day.
   */
  isActiveOn(today: CalendarDate): boolean {
    return !this.validUntil.isBefore(today);
  }
}
