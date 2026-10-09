import {Injectable} from '@angular/core';
import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {Quantity} from '../../shared/domain/model/quantity';
import {
  REQUEST_PRIORITIES,
  RequestStatus,
  SupplyRequest
} from '../domain/model/supply-request.entity';
import {SupplyRequestResource, SupplyRequestsResponse} from './requisition-response';

const STATUSES: readonly RequestStatus[] = ['pending', 'accepted', 'rejected'];

/**
 * Maps supply request resources from the backend into SupplyRequest entities and back.
 */
@Injectable({providedIn: 'root'})
export class SupplyRequestAssembler {
  /**
   * Converts a supply request resource into a SupplyRequest entity.
   *
   * @param resource - Raw request object returned by the backend.
   */
  toEntityFromResource(resource: SupplyRequestResource): SupplyRequest {
    return new SupplyRequest({
      id: resource.id,
      productId: resource.productId,
      supplierId: resource.supplierId,
      minimarketId: resource.minimarketId,
      quantity: Quantity.of(resource.quantity),
      reason: resource.reason,
      requiredOn: CalendarDate.of(resource.requiredOn),
      priority: REQUEST_PRIORITIES.find(priority => priority === resource.priority) ?? 'medium',
      status: STATUSES.find(status => status === resource.status) ?? 'pending'
    });
  }

  /**
   * Converts a requests payload into SupplyRequest entities.
   *
   * @param response - Backend response with request resources.
   */
  toEntitiesFromResponse(response: SupplyRequestsResponse): SupplyRequest[] {
    return response.requests.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts a SupplyRequest entity into the resource sent to the backend.
   *
   * @param request - Entity to serialize.
   */
  toResourceFromEntity(request: SupplyRequest): SupplyRequestResource {
    return {
      id: request.id,
      productId: request.productId,
      supplierId: request.supplierId,
      minimarketId: request.minimarketId,
      quantity: request.quantity.value,
      reason: request.reason,
      requiredOn: request.requiredOn.toString(),
      priority: request.priority,
      status: request.status
    };
  }
}
