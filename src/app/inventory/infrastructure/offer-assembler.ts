import {Injectable} from '@angular/core';
import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {Quantity} from '../../shared/domain/model/quantity';
import {Offer} from '../domain/model/offer.entity';
import {OfferResource, OffersResponse} from './inventory-response';

/**
 * Maps offer resources from the backend into Offer domain entities and back.
 */
@Injectable({providedIn: 'root'})
export class OfferAssembler {
  /**
   * Converts an offer resource into an Offer entity.
   *
   * @param resource - Raw offer object returned by the backend.
   */
  toEntityFromResource(resource: OfferResource): Offer {
    return new Offer({
      id: resource.id,
      productId: resource.productId,
      quantity: Quantity.of(resource.quantity),
      validUntil: CalendarDate.of(resource.validUntil),
      createdBy: resource.createdBy,
      createdOn: CalendarDate.of(resource.createdOn)
    });
  }

  /**
   * Converts an offers payload into Offer entities.
   *
   * @param response - Backend response with offer resources.
   */
  toEntitiesFromResponse(response: OffersResponse): Offer[] {
    return response.offers.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts an Offer entity into the resource sent to the backend.
   *
   * @param offer - Entity to serialize.
   */
  toResourceFromEntity(offer: Offer): OfferResource {
    return {
      id: offer.id,
      productId: offer.productId,
      quantity: offer.quantity.value,
      validUntil: offer.validUntil.toString(),
      createdBy: offer.createdBy,
      createdOn: offer.createdOn.toString()
    };
  }
}
