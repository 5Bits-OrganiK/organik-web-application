import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {InventoryEventResource, OfferResource, StockLotResource} from './inventory-response';

/**
 * Stock lots received by the minimarket while the backend is not available.
 *
 * @remarks
 * Expiration dates are expressed relative to today so the seeded lots keep the
 * same mix of normal, at-risk and critical statuses whenever the app runs.
 *
 * @param today - Reference day.
 */
export function stockLotsSeed(today: CalendarDate): StockLotResource[] {
  const inDays = (days: number) => today.plusDays(days).toString();
  return [
    {lotCode: 'LT-204', productId: 'ORG-01', quantity: 248, expiresOn: inDays(7), location: 'Cámara fría A', notes: ''},
    {lotCode: 'LT-188', productId: 'ORG-02', quantity: 96, expiresOn: inDays(10), location: 'Anaquel fresco', notes: ''},
    {lotCode: 'LT-311', productId: 'ORG-03', quantity: 402, expiresOn: inDays(110), location: 'Almacén seco', notes: ''},
    {lotCode: 'LT-090', productId: 'ORG-04', quantity: 72, expiresOn: inDays(3), location: 'Anaquel fresco', notes: ''},
    {lotCode: 'LT-412', productId: 'ORG-05', quantity: 280, expiresOn: inDays(22), location: 'Cámara fría A', notes: ''},
    {lotCode: 'LT-377', productId: 'ORG-06', quantity: 150, expiresOn: inDays(44), location: 'Cámara fría A', notes: ''}
  ];
}

/**
 * Inventory history while the backend is not available.
 *
 * @param today - Reference day.
 */
export function inventoryEventsSeed(today: CalendarDate): InventoryEventResource[] {
  const ago = (days: number) => today.plusDays(-days).toString();
  return [
    {id: 'evt-1', type: 'registered', productId: 'ORG-03', lotCode: 'LT-311', quantity: 402, cause: '', detail: 'Lot received', actorName: 'Cielo Atencio', occurredOn: ago(6)},
    {id: 'evt-2', type: 'waste', productId: 'ORG-02', lotCode: 'LT-188', quantity: 4, cause: 'damaged', detail: 'Crates damaged during unloading', actorName: 'Albino Caceres', occurredOn: ago(2)}
  ];
}

/**
 * Offers registered by the minimarket while the backend is not available.
 *
 * @param today - Reference day.
 */
export function offersSeed(today: CalendarDate): OfferResource[] {
  return [
    {id: 'off-1', productId: 'ORG-04', quantity: 30, validUntil: today.plusDays(3).toString(), createdBy: 'Albino Caceres', createdOn: today.plusDays(-1).toString()}
  ];
}
