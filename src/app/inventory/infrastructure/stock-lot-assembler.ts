import {Injectable} from '@angular/core';
import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {Quantity} from '../../shared/domain/model/quantity';
import {StockLot} from '../domain/model/stock-lot.entity';
import {StockLotResource, StockLotsResponse} from './inventory-response';

/**
 * Maps stock lot resources from the backend into StockLot domain entities and back.
 */
@Injectable({providedIn: 'root'})
export class StockLotAssembler {
  /**
   * Converts a stock lot resource into a StockLot entity.
   *
   * @param resource - Raw lot object returned by the backend.
   */
  toEntityFromResource(resource: StockLotResource): StockLot {
    return new StockLot({
      lotCode: resource.lotCode,
      productId: resource.productId,
      quantity: Quantity.of(resource.quantity),
      expiresOn: CalendarDate.of(resource.expiresOn),
      location: resource.location,
      notes: resource.notes
    });
  }

  /**
   * Converts a lots payload into StockLot entities.
   *
   * @param response - Backend response with lot resources.
   */
  toEntitiesFromResponse(response: StockLotsResponse): StockLot[] {
    return response.lots.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts a StockLot entity into the resource sent to the backend.
   *
   * @param lot - Entity to serialize.
   */
  toResourceFromEntity(lot: StockLot): StockLotResource {
    return {
      lotCode: lot.lotCode,
      productId: lot.productId,
      quantity: lot.quantity.value,
      expiresOn: lot.expiresOn.toString(),
      location: lot.location,
      notes: lot.notes
    };
  }
}
