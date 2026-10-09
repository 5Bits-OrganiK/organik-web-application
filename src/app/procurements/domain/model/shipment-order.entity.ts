import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {Quantity} from '../../../shared/domain/model/quantity';
import {OrderDecision} from './order-decision';
import {ShipmentLine} from './shipment-line';

/** Where an order is: waiting for the minimarket, accepted into its inventory, or rejected. */
export type OrderStatus = 'pending' | 'accepted' | 'rejected';

/**
 * Data required to build a {@link ShipmentOrder}.
 */
export interface ShipmentOrderProps {
  id: string;
  supplierId: string;
  /** Minimarket the order is addressed to. */
  minimarketId: string;
  lines: readonly ShipmentLine[];
  createdOn: CalendarDate;
  /** Name of the person who created the order. */
  createdBy: string;
  status: OrderStatus;
  decision?: OrderDecision;
}

/**
 * Represents an order a supplier sends to a linked minimarket, which its administrator accepts or rejects.
 */
export class ShipmentOrder {
  /** Identifier of the order, e.g. `ord-01`. */
  readonly id: string;
  readonly supplierId: string;
  readonly minimarketId: string;
  readonly lines: readonly ShipmentLine[];
  readonly createdOn: CalendarDate;
  readonly createdBy: string;
  readonly status: OrderStatus;
  /** Who answered the order and when; absent while it is pending. */
  readonly decision?: OrderDecision;

  /**
   * @throws DomainError if the order has no identifier, supplier, minimarket or lines, or its status and decision disagree.
   */
  constructor(props: ShipmentOrderProps) {
    if (!props.id.trim() || !props.supplierId.trim() || !props.minimarketId.trim()) {
      throw new DomainError('An order needs an identifier, a supplier and a minimarket');
    }
    if (props.lines.length === 0) {
      throw new DomainError('A shipment order needs at least one line');
    }
    if ((props.status === 'pending') !== !props.decision) {
      throw new DomainError('Only the orders that were answered have a decision');
    }
    this.id = props.id;
    this.supplierId = props.supplierId;
    this.minimarketId = props.minimarketId;
    this.lines = props.lines;
    this.createdOn = props.createdOn;
    this.createdBy = props.createdBy;
    this.status = props.status;
    this.decision = props.decision;
  }

  /** Units ordered across every line. */
  get totalQuantity(): Quantity {
    return this.lines.reduce((total, line) => total.plus(line.quantity), Quantity.zero());
  }

  /** Whether the minimarket still has to answer the order. */
  get isPending(): boolean {
    return this.status === 'pending';
  }

  /**
   * Accepts the order. The caller then moves its units into the inventory, which can happen only once
   * because an answered order cannot be answered again.
   *
   * @param actor - Administrator who accepts it.
   * @param today - Day of the decision.
   * @throws DomainError if the order was already answered.
   */
  accept(actor: string, today: CalendarDate): ShipmentOrder {
    this.requirePending();
    return new ShipmentOrder({...this, status: 'accepted', decision: new OrderDecision(actor, today)});
  }

  /**
   * Rejects the order; the inventory stays as it was.
   *
   * @param actor - Administrator who rejects it.
   * @param today - Day of the decision.
   * @param reason - Why the order is rejected.
   * @throws DomainError if the order was already answered or no reason is given.
   */
  reject(actor: string, today: CalendarDate, reason: string): ShipmentOrder {
    this.requirePending();
    if (!reason.trim()) {
      throw new DomainError('A rejected order needs a reason');
    }
    return new ShipmentOrder({...this, status: 'rejected', decision: new OrderDecision(actor, today, reason.trim())});
  }

  private requirePending(): void {
    if (!this.isPending) {
      throw new DomainError(`Order ${this.id} was already ${this.status}`);
    }
  }
}
