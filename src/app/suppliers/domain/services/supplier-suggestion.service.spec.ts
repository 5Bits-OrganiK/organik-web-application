import {EmailAddress} from '../../../shared/domain/model/email-address';
import {Supplier} from '../model/supplier.entity';
import {SupplierSpecialty} from '../model/supplier-specialty';
import {SupplierSuggestionService} from './supplier-suggestion.service';

const supplier = (id: string, specialties: SupplierSpecialty[]) =>
  new Supplier({
    id,
    businessName: id,
    contactName: 'Contact',
    phone: '999 999 999',
    email: new EmailAddress('a@b.co'),
    categories: [],
    organicCertification: 'Certified',
    specialties
  });

describe('SupplierSuggestionService', () => {
  const service = new SupplierSuggestionService();

  it('should group suppliers by specialty in presentation order', () => {
    const result = service.suggest([
      supplier('cold', ['cold-chain']),
      supplier('fast', ['urgent-restock', 'fresh-produce'])
    ]);

    expect(result.map(group => group.reason)).toEqual(['urgent-restock', 'fresh-produce', 'cold-chain']);
    expect(result[1].suppliers.map(s => s.id)).toEqual(['fast']);
  });

  it('should omit situations nobody can solve', () => {
    const result = service.suggest([supplier('cold', ['cold-chain'])]);
    expect(result.map(group => group.reason)).toEqual(['cold-chain']);
  });
});
