import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {Quantity} from '../../../shared/domain/model/quantity';

/**
 * Value object representing one product of an order: the units asked of a supplier lot.
 */
export class ShipmentLine {
  /**
   * @param productId - SKU of the ordered product.
   * @param quantity - Units ordered; it must be greater than zero.
   * @param lotCode - Lot of the supplier the units come from.
   * @param expiresOn - Expiration day of that lot.
   * @throws DomainError if the quantity is zero or the product or the lot is blank.
   */
  constructor(
    readonly productId: string,
    readonly quantity: Quantity,
    readonly lotCode: string,
    readonly expiresOn: CalendarDate
  ) {
    if (!productId.trim() || !lotCode.trim() || quantity.value === 0) {
      throw new DomainError('An order line needs a product, a lot and a quantity greater than zero');
    }
  }
}
