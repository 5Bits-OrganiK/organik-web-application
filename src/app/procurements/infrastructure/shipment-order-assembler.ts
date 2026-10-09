import {Injectable} from '@angular/core';
import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {Quantity} from '../../shared/domain/model/quantity';
import {OrderDecision} from '../domain/model/order-decision';
import {OrderStatus, ShipmentOrder} from '../domain/model/shipment-order.entity';
import {ShipmentLine} from '../domain/model/shipment-line';
import {ShipmentOrderResource, ShipmentOrdersResponse} from './procurements-response';

const ORDER_STATUSES: readonly OrderStatus[] = ['pending', 'accepted', 'rejected'];

/**
 * Maps order resources from the backend into ShipmentOrder entities and back.
 */
@Injectable({providedIn: 'root'})
export class ShipmentOrderAssembler {
  /**
   * Converts an order resource into a ShipmentOrder entity.
   *
   * @param resource - Raw order object returned by the backend.
   */
  toEntityFromResource(resource: ShipmentOrderResource): ShipmentOrder {
    return new ShipmentOrder({
      id: resource.id,
      supplierId: resource.supplierId,
      minimarketId: resource.minimarketId,
      lines: resource.lines.map(
        line => new ShipmentLine(line.productId, Quantity.of(line.quantity), line.lotCode, CalendarDate.of(line.expiresOn))
      ),
      createdOn: CalendarDate.of(resource.createdOn),
      createdBy: resource.createdBy,
      status: ORDER_STATUSES.find(status => status === resource.status) ?? 'pending',
      decision:
        resource.decision &&
        new OrderDecision(resource.decision.decidedBy, CalendarDate.of(resource.decision.decidedOn), resource.decision.reason)
    });
  }

  /**
   * Converts an orders payload into ShipmentOrder entities.
   *
   * @param response - Backend response with order resources.
   */
  toEntitiesFromResponse(response: ShipmentOrdersResponse): ShipmentOrder[] {
    return response.shipments.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts a ShipmentOrder entity into the resource sent to the backend.
   *
   * @param order - Entity to serialize.
   */
  toResourceFromEntity(order: ShipmentOrder): ShipmentOrderResource {
    return {
      id: order.id,
      supplierId: order.supplierId,
      minimarketId: order.minimarketId,
      lines: order.lines.map(line => ({
        productId: line.productId,
        quantity: line.quantity.value,
        lotCode: line.lotCode,
        expiresOn: line.expiresOn.toString()
      })),
      createdOn: order.createdOn.toString(),
      createdBy: order.createdBy,
      status: order.status,
      decision: order.decision && {
        decidedBy: order.decision.decidedBy,
        decidedOn: order.decision.decidedOn.toString(),
        reason: order.decision.reason
      }
    };
  }
}
