import {DomainError} from '../../../shared/domain/model/domain-error';
import {EmailAddress} from '../../../shared/domain/model/email-address';
import {Supplier, SupplierProps} from './supplier.entity';

const props = (overrides: Partial<SupplierProps> = {}): SupplierProps => ({
  id: 'sup-1',
  businessName: 'BioAndes Organic',
  contactName: 'Marco Quispe',
  phone: '+51 976 112 204',
  email: new EmailAddress('contacto@bioandes.example'),
  categories: [' Frutas y verduras ', ''],
  organicCertification: 'Certificación orgánica nacional',
  specialties: ['fresh-produce'],
  ...overrides
});

describe('Supplier', () => {
  it('should derive a two-letter monogram from the business name', () => {
    expect(new Supplier(props()).initials).toBe('BI');
    expect(new Supplier(props({businessName: 'Valle Verde'})).initials).toBe('VA');
  });

  it('should clean up categories', () => {
    expect(new Supplier(props()).categories).toEqual(['Frutas y verduras']);
  });

  it('should require a business name', () => {
    expect(() => new Supplier(props({businessName: '  '}))).toThrow(DomainError);
  });

  it('should tell which situations the supplier is recommended for', () => {
    const supplier = new Supplier(props());
    expect(supplier.hasSpecialty('fresh-produce')).toBe(true);
    expect(supplier.hasSpecialty('cold-chain')).toBe(false);
  });
});
