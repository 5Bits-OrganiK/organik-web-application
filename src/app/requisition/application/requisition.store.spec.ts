import {Injectable} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {DomainError} from '../../shared/domain/model/domain-error';
import {Clock} from '../../shared/domain/services/clock';
import {CreateSupplyRequestCommand, RequisitionStore} from './requisition.store';

/** Clock frozen on the day of the approved mockups. */
@Injectable()
class FixedClock extends Clock {
  override now(): Date {
    return new Date(2026, 9, 2, 12, 0);
  }
}

/** Lets the in-memory gateway answer, whatever latency the environment simulates. */
const settleGateway = () => vi.advanceTimersByTimeAsync(1_000);

const requestCommand = (overrides: Partial<CreateSupplyRequestCommand> = {}): CreateSupplyRequestCommand => ({
  productId: 'ORG-07',
  supplierId: 'sup-bioandes',
  quantity: 50,
  reason: 'Demanda semanal',
  requiredOn: '2026-10-09',
  priority: 'high',
  ...overrides
});

describe('RequisitionStore', () => {
  let store: RequisitionStore;

  beforeEach(async () => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({providers: [{provide: Clock, useClass: FixedClock}]});
    store = TestBed.inject(RequisitionStore);
    store.loadRequisition();
    await settleGateway();
  });

  afterEach(() => vi.useRealTimers());

  it('should join requests with product and supplier names', () => {
    expect(store.requestItems()[0]).toMatchObject({
      id: 'req-1',
      productName: 'Yogurt orgánico',
      supplierName: 'Anita Gamboa',
      status: 'pending'
    });
    expect(store.requestCount()).toBe(5);
  });

  it('should create requests with the next identifier', async () => {
    store.createSupplyRequest(requestCommand()).subscribe();
    await settleGateway();

    expect(store.requestItems().at(-1)).toMatchObject({id: 'req-6', productName: 'Brócoli orgánico'});
  });

  it('should refuse requests required in the past', () => {
    expect(() => store.createSupplyRequest(requestCommand({requiredOn: '2026-10-01'}))).toThrow(DomainError);
  });

  it('should expose the latest request a supplier accepted', () => {
    expect(store.latestAcceptedRequest()).toMatchObject({id: 'req-5', status: 'accepted'});
  });
});

describe('RequisitionStore for a signed-in user', () => {
  beforeEach(() => vi.useFakeTimers());

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  async function setup(userId: string): Promise<RequisitionStore> {
    sessionStorage.setItem('organik.session', userId);
    TestBed.configureTestingModule({providers: [{provide: Clock, useClass: FixedClock}]});
    const store = TestBed.inject(RequisitionStore);
    store.loadRequisition();
    await settleGateway();
    return store;
  }

  it('should show a supplier only the needs addressed to it', async () => {
    const store = await setup('usr-4');

    expect(store.requestItems().map(item => item.id)).toEqual(['req-3', 'req-5']);
  });

  it('should not let a supplier create a request', async () => {
    const store = await setup('usr-4');

    expect(() => store.createSupplyRequest(requestCommand())).toThrow(DomainError);
  });

  it('should show the minimarket its own requests', async () => {
    const store = await setup('usr-1');

    expect(store.requestCount()).toBe(5);
  });
});
