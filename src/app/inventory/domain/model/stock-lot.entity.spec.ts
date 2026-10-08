import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {Quantity} from '../../../shared/domain/model/quantity';
import {ExpirationPolicy} from './expiration-policy';
import {StockLot, StockLotProps} from './stock-lot.entity';

const props = (overrides: Partial<StockLotProps> = {}): StockLotProps => ({
  lotCode: ' lt-204 ',
  productId: 'ORG-01',
  quantity: Quantity.of(248),
  expiresOn: CalendarDate.of('2026-10-09'),
  location: 'Cámara fría A',
  notes: '',
  ...overrides
});

describe('StockLot', () => {
  const today = CalendarDate.of('2026-10-02');

  it('should normalize the lot code', () => {
    expect(new StockLot(props()).lotCode).toBe('LT-204');
  });

  it('should require a location', () => {
    expect(() => new StockLot(props({location: ' '}))).toThrow(DomainError);
  });

  it('should count the days left before expiring', () => {
    expect(new StockLot(props()).daysToExpire(today)).toBe(7);
  });

  it('should be at risk when it expires within a week', () => {
    expect(new StockLot(props()).statusOn(today, ExpirationPolicy.default())).toBe('risk');
  });

  it('should be critical when it expires in three days or fewer', () => {
    const lot = new StockLot(props({expiresOn: CalendarDate.of('2026-10-05')}));
    expect(lot.statusOn(today, ExpirationPolicy.default())).toBe('critical');
  });

  it('should revise its editable data without touching its identity', () => {
    const revised = new StockLot(props()).revise({quantity: Quantity.of(10), location: 'Anaquel fresco'});

    expect(revised.lotCode).toBe('LT-204');
    expect(revised.quantity.value).toBe(10);
    expect(revised.location).toBe('Anaquel fresco');
  });

  it('should discard units up to what it holds', () => {
    const lot = new StockLot(props({quantity: Quantity.of(10)}));

    expect(lot.discard(Quantity.of(4)).quantity.value).toBe(6);
    expect(() => lot.discard(Quantity.of(11))).toThrow(DomainError);
    expect(() => lot.discard(Quantity.of(0))).toThrow(DomainError);
  });
});
