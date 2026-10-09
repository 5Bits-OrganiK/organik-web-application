import {Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {DomainError} from '../../shared/domain/model/domain-error';
import {Clock} from '../../shared/domain/services/clock';
import {InventoryStore, RegisterStockCommand} from './inventory.store';

/** Clock frozen on the day of the approved mockups. */
@Injectable()
class FixedClock extends Clock {
  override now(): Date {
    return new Date(2026, 9, 2, 12, 0);
  }
}

/** Lets the in-memory gateway answer, whatever latency the environment simulates. */
const settleGateway = () => vi.advanceTimersByTimeAsync(1_000);

const command = (overrides: Partial<RegisterStockCommand> = {}): RegisterStockCommand => ({
  productId: 'ORG-07',
  lotCode: 'lt-500',
  quantity: 60,
  expiresOn: '2026-10-20',
  location: 'Anaquel fresco',
  notes: '',
  ...overrides
});

describe('InventoryStore', () => {
  let store: InventoryStore;

  beforeEach(async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({providers: [{provide: Clock, useClass: FixedClock}]});
    store = TestBed.inject(InventoryStore);
    store.loadInventory();
    await settleGateway();
  });

  afterEach(() => vi.useRealTimers());

  it('should classify every lot according to its expiration', () => {
    const statuses = Object.fromEntries(store.items().map(item => [item.lotCode, item.status]));
    expect(statuses).toMatchObject({
      'LT-204': 'risk',
      'LT-188': 'normal',
      'LT-311': 'normal',
      'LT-090': 'critical'
    });
  });

  it('should add up the units available', () => {
    expect(store.totalUnits()).toBe(1248);
  });

  it('should report the products under their minimum stock', () => {
    expect(store.shortages().map(shortage => shortage.sku)).toEqual(['ORG-04', 'ORG-07']);
  });

  it('should register a new lot', async () => {
    store.registerStock(command()).subscribe();
    await settleGateway();

    expect(store.hasLot('LT-500')).toBe(true);
    expect(store.items().find(item => item.lotCode === 'LT-500')?.productName).toBe('Brócoli orgánico');
  });

  it('should refuse duplicated and expired lots', () => {
    expect(() => store.registerStock(command({lotCode: 'LT-204'}))).toThrow(DomainError);
    expect(() => store.registerStock(command({expiresOn: '2026-10-01'}))).toThrow(DomainError);
  });

  it('should list the lots of a product and its stock', () => {
    expect(store.lotsOf('ORG-01').map(item => item.lotCode)).toEqual(['LT-204']);
    expect(store.stockOf('ORG-01')).toBe(248);
    expect(store.lotsOf('ORG-07')).toEqual([]);
  });

  it('should update a lot, refuse negative quantities and keep the history', async () => {
    store.updateLot({lotCode: 'LT-204', quantity: 200, expiresOn: '2026-10-09', location: 'Cámara fría A', notes: ''}).subscribe();
    await settleGateway();

    expect(store.items().find(item => item.lotCode === 'LT-204')?.quantity).toBe(200);
    expect(store.events()[0]).toMatchObject({type: 'updated', lotCode: 'LT-204', actorName: 'System'});
    expect(store.events()[0].occurredOn.toString()).toBe('2026-10-02');
    expect(() => store.updateLot({lotCode: 'LT-204', quantity: -1, expiresOn: '2026-10-09', location: 'x', notes: ''})).toThrow(DomainError);
    expect(store.items().find(item => item.lotCode === 'LT-204')?.quantity).toBe(200);
  });

  it('should register waste, discount the stock and refuse an excess', async () => {
    store.registerWaste({lotCode: 'LT-188', quantity: 6, cause: 'damaged'}).subscribe();
    await settleGateway();

    expect(store.items().find(item => item.lotCode === 'LT-188')?.quantity).toBe(90);
    expect(store.events()[0]).toMatchObject({type: 'waste', quantity: 6, cause: 'damaged'});
    expect(() => store.registerWaste({lotCode: 'LT-188', quantity: 91, cause: 'expired'})).toThrow(DomainError);
    expect(store.items().find(item => item.lotCode === 'LT-188')?.quantity).toBe(90);
  });

  it('should register an offer without discounting the stock and refuse more units than the stock', async () => {
    store.registerOffer({productId: 'ORG-01', quantity: 50, validUntil: '2026-10-08'}).subscribe();
    await settleGateway();

    expect(store.offers()[0]).toMatchObject({productName: 'Yogurt orgánico', quantity: 50, active: true});
    expect(store.stockOf('ORG-01')).toBe(248);
    expect(() => store.registerOffer({productId: 'ORG-01', quantity: 249, validUntil: '2026-10-08'})).toThrow(DomainError);
  });

  it('should add the lines of an accepted order as lots exactly once per call', async () => {
    store.receiveOrder('ord-9', [{productId: 'ORG-07', quantity: 40, lotCode: 'LT-900', expiresOn: '2026-10-20'}]).subscribe();
    await settleGateway();

    expect(store.stockOf('ORG-07')).toBe(40);
    expect(store.events()[0]).toMatchObject({type: 'order-received', lotCode: 'LT-900'});
  });
});
