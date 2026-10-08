import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {Quantity} from '../../../shared/domain/model/quantity';

/** Kind of change recorded in the inventory history. */
export type InventoryEventType =
  | 'registered'
  | 'updated'
  | 'waste'
  | 'offer'
  | 'order-received'
  | 'product-updated';

/** Every kind of inventory event. */
export const INVENTORY_EVENT_TYPES: readonly InventoryEventType[] = [
  'registered',
  'updated',
  'waste',
  'offer',
  'order-received',
  'product-updated'
];

/** Reasons why units are lost. */
export type WasteCause = 'expired' | 'damaged' | 'temperature' | 'other';

/** Every waste cause. */
export const WASTE_CAUSES: readonly WasteCause[] = ['expired', 'damaged', 'temperature', 'other'];

/**
 * Data required to build an {@link InventoryEvent}.
 */
export interface InventoryEventProps {
  id: string;
  type: InventoryEventType;
  productId: string;
  lotCode: string | null;
  quantity: Quantity | null;
  /** Cause of a waste, empty for the other events. */
  cause: string;
  /** Free text that describes what changed. */
  detail: string;
  actorName: string;
  occurredOn: CalendarDate;
}

/**
 * Represents a change of the inventory (a registration, an update, a waste, an offer or a reception)
 * together with who made it and when, so every movement can be traced.
 */
export class InventoryEvent {
  readonly id: string;
  readonly type: InventoryEventType;
  readonly productId: string;
  readonly lotCode: string | null;
  readonly quantity: Quantity | null;
  readonly cause: string;
  readonly detail: string;
  readonly actorName: string;
  readonly occurredOn: CalendarDate;

  /**
   * @throws DomainError if the identifier or the actor is blank.
   */
  constructor(props: InventoryEventProps) {
    if (!props.id.trim() || !props.actorName.trim()) {
      throw new DomainError('An inventory event needs an identifier and an actor');
    }
    this.id = props.id;
    this.type = props.type;
    this.productId = props.productId;
    this.lotCode = props.lotCode;
    this.quantity = props.quantity;
    this.cause = props.cause;
    this.detail = props.detail.trim();
    this.actorName = props.actorName.trim();
    this.occurredOn = props.occurredOn;
  }
}
