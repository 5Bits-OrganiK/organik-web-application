import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {ShipmentOrderResource} from './procurements-response';

/** Minimarket the demo data belongs to. */
export const DEMO_MINIMARKET_ID = 'mm-vida-verde';

/** Minimarkets a supplier can send orders to (the ones linked with it). */
export const LINKED_MINIMARKETS: readonly {id: string; name: string}[] = [
  {id: DEMO_MINIMARKET_ID, name: 'Vida Verde Minimarket'}
];

/**
 * Orders sent by suppliers while the backend is not available.
 *
 * @param today - Reference day.
 */
export function shipmentOrdersSeed(today: CalendarDate): ShipmentOrderResource[] {
  const inDays = (days: number) => today.plusDays(days).toString();
  return [
    {
      id: 'ord-01',
      supplierId: 'sup-bioandes',
      minimarketId: DEMO_MINIMARKET_ID,
      lines: [
        {productId: 'ORG-04', quantity: 45, lotCode: 'BA-0412', expiresOn: inDays(12)},
        {productId: 'ORG-07', quantity: 30, lotCode: 'BA-0418', expiresOn: inDays(10)}
      ],
      createdOn: inDays(0),
      createdBy: 'Marco Quispe',
      status: 'pending'
    },
    {
      id: 'ord-02',
      supplierId: 'sup-anita-gamboa',
      minimarketId: DEMO_MINIMARKET_ID,
      lines: [
        {productId: 'ORG-01', quantity: 24, lotCode: 'AG-1101', expiresOn: inDays(20)},
        {productId: 'ORG-05', quantity: 30, lotCode: 'AG-1107', expiresOn: inDays(25)}
      ],
      createdOn: inDays(-3),
      createdBy: 'Anita Gamboa',
      status: 'accepted',
      decision: {decidedBy: 'Albino Caceres', decidedOn: inDays(-2), reason: ''}
    },
    {
      id: 'ord-03',
      supplierId: 'sup-valle-verde',
      minimarketId: DEMO_MINIMARKET_ID,
      lines: [{productId: 'ORG-03', quantity: 100, lotCode: 'VV-0910', expiresOn: inDays(120)}],
      createdOn: inDays(-5),
      createdBy: 'Valle Verde',
      status: 'rejected',
      decision: {decidedBy: 'Albino Caceres', decidedOn: inDays(-4), reason: 'The quantity exceeds our storage capacity this week.'}
    },
    {
      id: 'ord-04',
      supplierId: 'sup-anita-gamboa',
      minimarketId: DEMO_MINIMARKET_ID,
      lines: [{productId: 'ORG-05', quantity: 60, lotCode: 'AG-1107', expiresOn: inDays(25)}],
      createdOn: inDays(-1),
      createdBy: 'Anita Gamboa',
      status: 'pending'
    }
  ];
}
