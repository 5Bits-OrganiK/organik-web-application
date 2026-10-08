import {Injectable} from '@angular/core';
import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {Quantity} from '../../shared/domain/model/quantity';
import {OfferedProduct} from '../domain/model/offered-product.entity';
import {OfferedProductResource, OfferedProductsResponse} from './suppliers-response';

/**
 * Maps offered product resources from the backend into OfferedProduct domain entities and back.
 */
@Injectable({providedIn: 'root'})
export class OfferedProductAssembler {
  /**
   * Converts an offered product resource into an OfferedProduct entity.
   *
   * @param resource - Raw object returned by the backend.
   */
  toEntityFromResource(resource: OfferedProductResource): OfferedProduct {
    return new OfferedProduct({
      id: resource.id,
      supplierId: resource.supplierId,
      productId: resource.productId,
      lotCode: resource.lotCode,
      availableQuantity: Quantity.of(resource.availableQuantity),
      expiresOn: CalendarDate.of(resource.expiresOn),
      updatedOn: CalendarDate.of(resource.updatedOn)
    });
  }

  /**
   * Converts an offered products payload into OfferedProduct entities.
   *
   * @param response - Backend response with offered product resources.
   */
  toEntitiesFromResponse(response: OfferedProductsResponse): OfferedProduct[] {
    return response.offeredProducts.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts an OfferedProduct entity into the resource sent to the backend.
   *
   * @param offered - Entity to serialize.
   */
  toResourceFromEntity(offered: OfferedProduct): OfferedProductResource {
    return {
      id: offered.id,
      supplierId: offered.supplierId,
      productId: offered.productId,
      lotCode: offered.lotCode,
      availableQuantity: offered.availableQuantity.value,
      expiresOn: offered.expiresOn.toString(),
      updatedOn: offered.updatedOn.toString()
    };
  }
}
