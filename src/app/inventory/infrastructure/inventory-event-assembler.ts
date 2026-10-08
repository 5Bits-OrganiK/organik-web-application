import {Injectable} from '@angular/core';
import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {Quantity} from '../../shared/domain/model/quantity';
import {INVENTORY_EVENT_TYPES, InventoryEvent} from '../domain/model/inventory-event';
import {InventoryEventResource, InventoryEventsResponse} from './inventory-response';

/**
 * Maps inventory event resources from the backend into InventoryEvent domain entities and back.
 */
@Injectable({providedIn: 'root'})
export class InventoryEventAssembler {
  /**
   * Converts an inventory event resource into an InventoryEvent entity.
   *
   * @param resource - Raw event object returned by the backend.
   */
  toEntityFromResource(resource: InventoryEventResource): InventoryEvent {
    return new InventoryEvent({
      id: resource.id,
      type: INVENTORY_EVENT_TYPES.find(type => type === resource.type) ?? 'updated',
      productId: resource.productId,
      lotCode: resource.lotCode,
      quantity: resource.quantity === null ? null : Quantity.of(resource.quantity),
      cause: resource.cause,
      detail: resource.detail,
      actorName: resource.actorName,
      occurredOn: CalendarDate.of(resource.occurredOn)
    });
  }

  /**
   * Converts an events payload into InventoryEvent entities.
   *
   * @param response - Backend response with event resources.
   */
  toEntitiesFromResponse(response: InventoryEventsResponse): InventoryEvent[] {
    return response.events.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts an InventoryEvent entity into the resource sent to the backend.
   *
   * @param event - Entity to serialize.
   */
  toResourceFromEntity(event: InventoryEvent): InventoryEventResource {
    return {
      id: event.id,
      type: event.type,
      productId: event.productId,
      lotCode: event.lotCode,
      quantity: event.quantity?.value ?? null,
      cause: event.cause,
      detail: event.detail,
      actorName: event.actorName,
      occurredOn: event.occurredOn.toString()
    };
  }
}
