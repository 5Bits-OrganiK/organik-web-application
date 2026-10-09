import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {SupplyRequestResource} from './requisition-response';

/**
 * Supply requests created by the minimarket while the backend is not available.
 *
 * @remarks
 * Dates are expressed relative to today so the seed always looks current.
 *
 * @param today - Reference day.
 */
export function supplyRequestsSeed(today: CalendarDate): SupplyRequestResource[] {
  const inDays = (days: number) => today.plusDays(days).toString();
  return [
    {id: 'req-1', productId: 'ORG-01', supplierId: 'sup-anita-gamboa', minimarketId: 'mm-vida-verde', quantity: 24, reason: 'Reposición por venta', requiredOn: inDays(4), priority: 'medium', status: 'pending'},
    {id: 'req-2', productId: 'ORG-05', supplierId: 'sup-anita-gamboa', minimarketId: 'mm-vida-verde', quantity: 30, reason: 'Demanda semanal', requiredOn: inDays(5), priority: 'medium', status: 'accepted'},
    {id: 'req-3', productId: 'ORG-04', supplierId: 'sup-bioandes', minimarketId: 'mm-vida-verde', quantity: 45, reason: 'Anaquel principal', requiredOn: inDays(3), priority: 'high', status: 'pending'},
    {id: 'req-4', productId: 'ORG-06', supplierId: 'sup-anita-gamboa', minimarketId: 'mm-vida-verde', quantity: 15, reason: 'Stock mínimo', requiredOn: inDays(7), priority: 'low', status: 'rejected'},
    {id: 'req-5', productId: 'ORG-07', supplierId: 'sup-bioandes', minimarketId: 'mm-vida-verde', quantity: 30, reason: 'Reposición programada', requiredOn: inDays(6), priority: 'medium', status: 'accepted'}
  ];
}
