import {TestBed} from '@angular/core/testing';
import {ConservationStore} from '../../conservation/application/conservation.store';
import {AlertsStore} from './alerts.store';

/** Lets the in-memory gateway answer, whatever latency the environment simulates. */
const settleGateway = () => vi.advanceTimersByTimeAsync(1_000);

describe('AlertsStore', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('should expose the alerts raised by the conservation readings', async () => {
    const store = TestBed.inject(AlertsStore);
    expect(store.alerts()).toEqual([]);

    store.loadAlerts();
    await settleGateway();

    expect(store.alerts().length).toBeGreaterThan(0);
    expect(store.alerts()).toEqual(TestBed.inject(ConservationStore).alerts());
  });
});
