import {DomainError} from '../../../shared/domain/model/domain-error';
import {Quantity} from '../../../shared/domain/model/quantity';
import {Product, ProductProps} from './product.entity';

const props = (overrides: Partial<ProductProps> = {}): ProductProps => ({
  id: 'ORG-04',
  name: ' Tomate orgánico ',
  categoryId: 'fruits-vegetables',
  supplierId: 'sup-bioandes',
  unit: 'kg',
  minimumStock: Quantity.of(80),
  storageCondition: 'fresh',
  ...overrides
});

describe('Product', () => {
  it('should trim the name', () => {
    expect(new Product(props()).name).toBe('Tomate orgánico');
  });

  it('should require a name and a supplier', () => {
    expect(() => new Product(props({name: ' '}))).toThrow(DomainError);
    expect(() => new Product(props({supplierId: ''}))).toThrow(DomainError);
  });

  it('should flag stock under the minimum', () => {
    const product = new Product(props());
    expect(product.isBelowMinimum(Quantity.of(72))).toBe(true);
    expect(product.isBelowMinimum(Quantity.of(80))).toBe(false);
  });
});
