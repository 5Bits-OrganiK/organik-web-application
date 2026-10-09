import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {Quantity} from '../../../shared/domain/model/quantity';

/**
 * Lifecycle of a supply request: the supplier accepts or rejects it before a shipment is created.
 */
export type RequestStatus = 'pending' | 'accepted' | 'rejected';

/** How soon the minimarket needs the products. */
export type RequestPriority = 'low' | 'medium' | 'high';

/** Every request priority, from the least to the most urgent. */
export const REQUEST_PRIORITIES: readonly RequestPriority[] = ['low', 'medium', 'high'];

/**
 * Data required to build a {@link SupplyRequest}.
 */
export interface SupplyRequestProps {
  id: string;
  productId: string;
  supplierId: string;
  /** Minimarket that needs the products. */
  minimarketId: string;
  quantity: Quantity;
  reason: string;
  requiredOn: CalendarDate;
  priority: RequestPriority;
  status: RequestStatus;
}

/**
 * Represents a request the minimarket sends to a supplier to replenish a product.
 */
export class SupplyRequest {
  /** Identifier of the request, e.g. `req-1`. */
  readonly id: string;
  readonly productId: string;
  readonly supplierId: string;
  readonly minimarketId: string;
  readonly quantity: Quantity;
  /** Why the products are needed, e.g. "Demanda semanal". */
  readonly reason: string;
  /** Day the products are needed by. */
  readonly requiredOn: CalendarDate;
  readonly priority: RequestPriority;
  readonly status: RequestStatus;

  /**
   * @throws DomainError if a reference or the reason is blank, or the quantity is zero.
   */
  constructor(props: SupplyRequestProps) {
    for (const [field, value] of Object.entries({
      id: props.id,
      productId: props.productId,
      supplierId: props.supplierId,
      minimarketId: props.minimarketId,
      reason: props.reason
    })) {
      if (!value.trim()) {
        throw new DomainError(`Supply request ${field} is required`);
      }
    }
    if (props.quantity.value === 0) {
      throw new DomainError('A supply request needs a quantity greater than zero');
    }
    this.id = props.id;
    this.productId = props.productId;
    this.supplierId = props.supplierId;
    this.minimarketId = props.minimarketId;
    this.quantity = props.quantity;
    this.reason = props.reason.trim();
    this.requiredOn = props.requiredOn;
    this.priority = props.priority;
    this.status = props.status;
  }
}
