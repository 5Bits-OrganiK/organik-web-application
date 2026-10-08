import {TestBed} from '@angular/core/testing';
import {DomainError} from '../../shared/domain/model/domain-error';
import {SuppliersStore} from './suppliers.store';

const command = {
  businessName: 'Granja Sol',
  contactName: 'Rosa Vega',
  phone: '+51 900 100 200',
  email: 'rosa@granjasol.example',
  categories: 'Lácteos, Granos',
  organicCertification: 'Certificación orgánica nacional'
};

/** Lets the in-memory gateway answer, whatever latency the environment simulates. */
const settleGateway = () => vi.advanceTimersByTimeAsync(1_000);

describe('SuppliersStore', () => {
  let store: SuppliersStore;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    store = TestBed.inject(SuppliersStore);
  });

  afterEach(() => vi.useRealTimers());

  it('should load the suppliers once', async () => {
    store.loadSuppliers();
    await settleGateway();

    expect(store.suppliers().length).toBe(4);
    expect(store.findById('sup-bioandes')?.businessName).toBe('BioAndes Organic');
  });

  it('should add a registered supplier to the list', async () => {
    store.loadSuppliers();
    await settleGateway();

    store.registerSupplier(command).subscribe();
    await settleGateway();

    const created = store.suppliers().find(s => s.businessName === 'Granja Sol');
    expect(created?.categories).toEqual(['Lácteos', 'Granos']);
  });

  it('should refuse a supplier with an invalid e-mail', () => {
    expect(() => store.registerSupplier({...command, email: 'nope'})).toThrow(DomainError);
  });

  it('should suggest suppliers for every active specialty', async () => {
    store.loadSuppliers();
    await settleGateway();

    expect(store.suggestions().map(group => group.reason)).toEqual([
      'urgent-restock',
      'fresh-produce',
      'cold-chain'
    ]);
  });
});
