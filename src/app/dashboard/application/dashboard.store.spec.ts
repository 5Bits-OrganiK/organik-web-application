import {TestBed} from '@angular/core/testing';
import {provideTranslateService} from '@ngx-translate/core';
import {DashboardStore} from './dashboard.store';

/** Lets the in-memory gateway answer, whatever latency the environment simulates. */
const settleGateway = () => vi.advanceTimersByTimeAsync(1_000);

describe('DashboardStore', () => {
  let store: DashboardStore;

  beforeEach(async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 2, 12, 0));
    TestBed.configureTestingModule({
      providers: [provideTranslateService()]
    });
    store = TestBed.inject(DashboardStore);
    store.loadDashboard();
    await settleGateway();
  });

  afterEach(() => vi.useRealTimers());

  it('should summarize the figures of every context', () => {
    expect(store.summary()).toEqual({health: 87, units: 1248, requests: 5, pendingShipments: 3});
  });

  it('should highlight the lot that expires first', () => {
    expect(store.activity()[0]).toEqual({
      kind: 'expiration',
      tone: 'urgent',
      params: {product: 'Tomate orgánico', days: 3}
    });
  });

  it('should report the last accepted request and a healthy sensor', () => {
    expect(store.activity().slice(1)).toEqual([
      {kind: 'request', tone: 'info', params: {supplier: 'BioAndes Organic'}},
      {kind: 'sensor', tone: 'info', params: {zone: 'Cámara fría A'}}
    ]);
  });
});

describe('DashboardStore for each kind of user', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 9, 2, 12, 0));
  });

  afterEach(() => {
    vi.useRealTimers();
    sessionStorage.clear();
  });

  async function setup(userId: string): Promise<DashboardStore> {
    sessionStorage.setItem('organik.session', userId);
    TestBed.configureTestingModule({
      providers: [provideTranslateService()]
    });
    const store = TestBed.inject(DashboardStore);
    store.loadDashboard();
    await settleGateway();
    return store;
  }

  it('should give a supplier its own figures', async () => {
    const store = await setup('usr-4');

    expect(store.isSupplier()).toBe(true);
    expect(store.supplierSummary()).toEqual({needs: 2, offered: 2, pending: 1, accepted: 1, rejected: 0});
  });

  it('should tell the administrator what needs attention', async () => {
    const store = await setup('usr-1');

    expect(store.isSupplier()).toBe(false);
    expect(store.attention().pendingOrders).toBe(3);
    expect(store.attention().expiring).toBeGreaterThan(0);
  });
});
