import {Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {InventoryStore} from '../../inventory/application/inventory.store';
import {DomainError} from '../../shared/domain/model/domain-error';
import {Clock} from '../../shared/domain/services/clock';
import {ProcurementsStore} from './procurements.store';

/** Clock frozen on the day of the approved mockups. */
@Injectable()
class FixedClock extends Clock {
  override now(): Date {
    return new Date(2026, 9, 2, 12, 0);
  }
}

/** Lets the in-memory gateway answer, whatever latency the environment simulates. */
const settleGateway = () => vi.advanceTimersByTimeAsync(1_000);

/** Signs a seeded user in and loads the order data. */
async function setup(userId: string): Promise<{store: ProcurementsStore; inventory: InventoryStore}> {
  sessionStorage.setItem('organik.session', userId);
  TestBed.configureTestingModule({providers: [{provide: Clock, useClass: FixedClock}]});
  const store = TestBed.inject(ProcurementsStore);
  store.loadProcurements();
  await settleGateway();
  return {store, inventory: TestBed.inject(InventoryStore)};
}

describe('ProcurementsStore', () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  it('should show a supplier only its own orders', async () => {
    const {store} = await setup('usr-4');

    expect(store.shipmentItems().map(item => item.id)).toEqual(['ord-01']);
  });

  it('should show the minimarket every order addressed to it with its status', async () => {
    const {store} = await setup('usr-1');

    expect(store.shipmentItems().map(item => [item.id, item.status])).toEqual(
      expect.arrayContaining([['ord-01', 'pending'], ['ord-02', 'accepted'], ['ord-03', 'rejected'], ['ord-04', 'pending']])
    );
    expect(store.pendingCount()).toBe(2);
  });

  it('should create a pending order without touching the inventory', async () => {
    const {store, inventory} = await setup('usr-4');
    const before = inventory.totalUnits();

    store.createOrder({minimarketId: 'mm-vida-verde', lines: [{offeringId: 'off-p-1', quantity: 20}]}).subscribe();
    await settleGateway();

    expect(store.shipmentItems().find(item => item.id === 'ord-05')).toMatchObject({status: 'pending', createdBy: 'Marco Quispe'});
    expect(inventory.totalUnits()).toBe(before);
  });

  it('should refuse more units than the supplier has available', async () => {
    const {store} = await setup('usr-4');

    expect(() => store.createOrder({minimarketId: 'mm-vida-verde', lines: [{offeringId: 'off-p-1', quantity: 301}]})).toThrow(DomainError);
  });

  it('should refuse a product of another supplier', async () => {
    const {store} = await setup('usr-4');

    expect(() => store.createOrder({minimarketId: 'mm-vida-verde', lines: [{offeringId: 'off-p-3', quantity: 1}]})).toThrow(DomainError);
  });

  it('should refuse an order created by someone who is not a supplier', async () => {
    const {store} = await setup('usr-1');

    expect(() => store.createOrder({minimarketId: 'mm-vida-verde', lines: [{offeringId: 'off-p-1', quantity: 1}]})).toThrow(DomainError);
  });

  it('should add the units to the inventory once when the administrator accepts', async () => {
    const {store, inventory} = await setup('usr-1');
    const before = inventory.totalUnits();

    store.acceptOrder('ord-01').subscribe();
    await settleGateway();

    expect(store.findItem('ord-01')).toMatchObject({status: 'accepted', decidedBy: 'Albino Caceres'});
    expect(inventory.totalUnits()).toBe(before + 75);
    expect(() => store.acceptOrder('ord-01')).toThrow(DomainError);
    expect(inventory.totalUnits()).toBe(before + 75);
  });

  it('should keep the reason and leave the inventory as it was when rejecting', async () => {
    const {store, inventory} = await setup('usr-1');
    const before = inventory.totalUnits();

    store.rejectOrder('ord-04', 'Too much stock').subscribe();
    await settleGateway();

    expect(store.findItem('ord-04')).toMatchObject({status: 'rejected', reason: 'Too much stock'});
    expect(inventory.totalUnits()).toBe(before);
  });

  it('should refuse to reject without a reason', async () => {
    const {store} = await setup('usr-1');

    expect(() => store.rejectOrder('ord-04', ' ')).toThrow(DomainError);
  });

  it('should not let the supplier or an operator decide', async () => {
    const supplier = await setup('usr-4');
    expect(supplier.store.canDecide('ord-01')).toBe(false);
    expect(() => supplier.store.acceptOrder('ord-01')).toThrow(DomainError);
  });

  it('should not let an operator decide', async () => {
    const {store} = await setup('usr-2');

    expect(store.canDecide('ord-01')).toBe(false);
    expect(() => store.rejectOrder('ord-01', 'No')).toThrow(DomainError);
  });
});
