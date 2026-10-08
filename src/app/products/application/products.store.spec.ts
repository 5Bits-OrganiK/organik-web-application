import {TestBed} from '@angular/core/testing';
import {DomainError} from '../../shared/domain/model/domain-error';
import {ProductsStore} from './products.store';

const command = {
  name: 'Avena orgánica',
  categoryId: 'grains',
  supplierId: 'sup-valle-verde',
  unit: 'kg' as const,
  minimumStock: 30,
  storageCondition: 'dry' as const
};

/** Lets the in-memory gateway answer, whatever latency the environment simulates. */
const settleGateway = () => vi.advanceTimersByTimeAsync(1_000);

describe('ProductsStore', () => {
  let store: ProductsStore;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    store = TestBed.inject(ProductsStore);
  });

  afterEach(() => vi.useRealTimers());

  it('should load categories and products', async () => {
    store.loadProducts();
    await settleGateway();

    expect(store.categories().length).toBe(6);
    expect(store.products().length).toBe(7);
    expect(store.findProduct('ORG-03')?.name).toBe('Quinua real');
  });

  it('should assign the next SKU to a new product', async () => {
    store.loadProducts();
    await settleGateway();

    store.addProduct(command).subscribe();
    await settleGateway();

    expect(store.findProduct('ORG-08')?.name).toBe('Avena orgánica');
  });

  it('should update the editable data of a product and refuse an unknown one', async () => {
    store.loadProducts();
    await settleGateway();

    store.updateProduct('ORG-03', {...command, name: 'Quinua blanca'}).subscribe();
    await settleGateway();

    expect(store.findProduct('ORG-03')?.name).toBe('Quinua blanca');
    expect(store.findProduct('ORG-03')?.id).toBe('ORG-03');
    expect(() => store.updateProduct('ORG-99', command)).toThrow(DomainError);
  });
});
