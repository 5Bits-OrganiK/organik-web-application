import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {OfferedProductResource, SupplierResource} from './suppliers-response';

/**
 * Suppliers known to the minimarket while the backend is not available.
 */
export const SUPPLIERS_SEED: SupplierResource[] = [
  {
    id: 'sup-anita-gamboa',
    businessName: 'Anita Gamboa',
    contactName: 'Anita Gamboa',
    phone: '+51 987 654 321',
    email: 'ventas@anitagamboa.example',
    categories: ['Lácteos'],
    organicCertification: 'Certificación orgánica nacional',
    specialties: ['urgent-restock']
  },
  {
    id: 'sup-bioandes',
    businessName: 'BioAndes Organic',
    contactName: 'Marco Quispe',
    phone: '+51 976 112 204',
    email: 'contacto@bioandes.example',
    categories: ['Frutas y verduras'],
    organicCertification: 'Certificación orgánica nacional',
    specialties: ['fresh-produce', 'urgent-restock']
  },
  {
    id: 'sup-valle-verde',
    businessName: 'Valle Verde',
    contactName: 'Lucía Paredes',
    phone: '+51 954 330 871',
    email: 'pedidos@valleverde.example',
    categories: ['Granos', 'Frutas y verduras'],
    organicCertification: 'Certificación orgánica nacional',
    specialties: ['fresh-produce']
  },
  {
    id: 'sup-ecolacteos',
    businessName: 'EcoLacteos',
    contactName: 'Raúl Medina',
    phone: '+51 943 208 665',
    email: 'logistica@ecolacteos.example',
    categories: ['Lácteos', 'Congelados'],
    organicCertification: 'Certificación orgánica nacional',
    specialties: ['cold-chain']
  }
];

/**
 * Products the suppliers offer to the minimarkets while the backend is not available.
 *
 * @remarks
 * Dates are expressed relative to today so the offers always look current.
 *
 * @param today - Reference day.
 */
export function offeredProductsSeed(today: CalendarDate): OfferedProductResource[] {
  const inDays = (days: number) => today.plusDays(days).toString();
  const ago = (days: number) => today.plusDays(-days).toString();
  return [
    {id: 'off-p-1', supplierId: 'sup-bioandes', productId: 'ORG-04', lotCode: 'BA-0412', availableQuantity: 300, expiresOn: inDays(12), updatedOn: ago(1)},
    {id: 'off-p-2', supplierId: 'sup-bioandes', productId: 'ORG-07', lotCode: 'BA-0418', availableQuantity: 120, expiresOn: inDays(10), updatedOn: ago(2)},
    {id: 'off-p-3', supplierId: 'sup-anita-gamboa', productId: 'ORG-01', lotCode: 'AG-1101', availableQuantity: 400, expiresOn: inDays(20), updatedOn: ago(1)},
    {id: 'off-p-4', supplierId: 'sup-anita-gamboa', productId: 'ORG-05', lotCode: 'AG-1107', availableQuantity: 500, expiresOn: inDays(25), updatedOn: ago(3)},
    {id: 'off-p-5', supplierId: 'sup-valle-verde', productId: 'ORG-02', lotCode: 'VV-0903', availableQuantity: 150, expiresOn: inDays(9), updatedOn: ago(1)},
    {id: 'off-p-6', supplierId: 'sup-valle-verde', productId: 'ORG-03', lotCode: 'VV-0910', availableQuantity: 600, expiresOn: inDays(120), updatedOn: ago(4)},
    {id: 'off-p-7', supplierId: 'sup-ecolacteos', productId: 'ORG-06', lotCode: 'EC-0501', availableQuantity: 180, expiresOn: inDays(40), updatedOn: ago(2)}
  ];
}
