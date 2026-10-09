import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {Quantity} from '../../../shared/domain/model/quantity';
import {ShipmentLine} from './shipment-line';
import {ShipmentOrder} from './shipment-order.entity';

const today = CalendarDate.of('2026-10-07');

const order = () =>
  new ShipmentOrder({
    id: 'ord-01',
    supplierId: 'sup-bioandes',
    minimarketId: 'mm-vida-verde',
    lines: [
      new ShipmentLine('ORG-04', Quantity.of(24), 'BA-0412', CalendarDate.of('2026-10-20')),
      new ShipmentLine('ORG-07', Quantity.of(30), 'BA-0418', CalendarDate.of('2026-10-18'))
    ],
    createdOn: today,
    createdBy: 'Marco Quispe',
    status: 'pending'
  });

describe('ShipmentOrder', () => {
  it('should add up the units of every line', () => {
    expect(order().totalQuantity.value).toBe(54);
  });

  it('should start pending and without a decision', () => {
    expect(order().isPending).toBe(true);
    expect(order().decision).toBeUndefined();
  });

  it('should keep who accepted it and when', () => {
    const accepted = order().accept('Albino Caceres', CalendarDate.of('2026-10-08'));

    expect(accepted.status).toBe('accepted');
    expect(accepted.decision?.decidedBy).toBe('Albino Caceres');
    expect(accepted.decision?.decidedOn.toString()).toBe('2026-10-08');
  });

  it('should keep the reason when it is rejected', () => {
    const rejected = order().reject('Albino Caceres', today, ' No space ');

    expect(rejected.status).toBe('rejected');
    expect(rejected.decision?.reason).toBe('No space');
  });

  it('should refuse to reject without a reason', () => {
    expect(() => order().reject('Albino Caceres', today, '  ')).toThrow(DomainError);
  });

  it('should not be answered twice', () => {
    const accepted = order().accept('Albino Caceres', today);

    expect(() => accepted.accept('Albino Caceres', today)).toThrow(DomainError);
    expect(() => accepted.reject('Albino Caceres', today, 'late')).toThrow(DomainError);
  });

  it('should refuse an order without lines', () => {
    expect(() => new ShipmentOrder({...order(), lines: []})).toThrow(DomainError);
  });
});
