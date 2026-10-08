import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {Quantity} from '../../../shared/domain/model/quantity';
import {OfferedProduct} from './offered-product.entity';

const today = CalendarDate.of('2026-10-07');

const offered = (overrides = {}) =>
  new OfferedProduct({
    id: 'off-p-1',
    supplierId: 'sup-bioandes',
    productId: 'p-1',
    lotCode: 'lt-1',
    availableQuantity: Quantity.of(40),
    expiresOn: CalendarDate.of('2026-12-01'),
    updatedOn: today,
    ...overrides
  });

describe('OfferedProduct', () => {
  it('should normalise the lot code', () => {
    expect(offered().lotCode).toBe('LT-1');
  });

  it('should refuse a blank supplier', () => {
    expect(() => offered({supplierId: ' '})).toThrow(DomainError);
  });

  it('should tell whether it can supply a quantity', () => {
    expect(offered().canSupply(Quantity.of(40))).toBe(true);
    expect(offered().canSupply(Quantity.of(41))).toBe(false);
  });

  it('should keep the update day when the availability changes', () => {
    const later = CalendarDate.of('2026-10-09');
    const updated = offered().update({availableQuantity: Quantity.of(10)}, later);

    expect(updated.availableQuantity.value).toBe(10);
    expect(updated.updatedOn.toString()).toBe('2026-10-09');
    expect(updated.belongsTo('sup-bioandes')).toBe(true);
    expect(updated.belongsTo('sup-other')).toBe(false);
  });
});
