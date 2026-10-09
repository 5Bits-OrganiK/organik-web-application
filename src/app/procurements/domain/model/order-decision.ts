import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';

/**
 * Value object with who answered an order, when, and why when it was rejected.
 */
export class OrderDecision {
  /**
   * @param decidedBy - Name of the administrator who answered the order.
   * @param decidedOn - Day the order was answered.
   * @param reason - Reason of the rejection; empty when the order was accepted.
   * @throws DomainError if the actor is blank.
   */
  constructor(
    readonly decidedBy: string,
    readonly decidedOn: CalendarDate,
    readonly reason: string = ''
  ) {
    if (!decidedBy.trim()) {
      throw new DomainError('A decision needs the person who made it');
    }
  }
}
