import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {Quantity} from '../../../shared/domain/model/quantity';
import {Offer, OfferProps} from './offer.entity';

const props = (overrides: Partial<OfferProps> = {}): OfferProps => ({
  id: 'off-1',
  productId: 'ORG-04',
  quantity: Quantity.of(30),
  validUntil: CalendarDate.of('2026-10-05'),
  createdBy: 'Albino Caceres',
  createdOn: CalendarDate.of('2026-10-02'),
  ...overrides
});

describe('Offer', () => {
  it('should be active until its last day', () => {
    const offer = new Offer(props());

    expect(offer.isActiveOn(CalendarDate.of('2026-10-05'))).toBe(true);
    expect(offer.isActiveOn(CalendarDate.of('2026-10-06'))).toBe(false);
  });

  it('should need at least one unit', () => {
    expect(() => new Offer(props({quantity: Quantity.of(0)}))).toThrow(DomainError);
  });

  it('should not expire before it is created', () => {
    expect(() => new Offer(props({validUntil: CalendarDate.of('2026-10-01')}))).toThrow(DomainError);
  });
});
