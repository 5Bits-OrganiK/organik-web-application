import {delay, Observable, of} from 'rxjs';
import {environment} from '../../../environments/environment';

/**
 * Wraps a value in an observable that resolves after the configured latency.
 *
 * @remarks
 * OrganiK's gateways are backed by in-memory data while the backend is not
 * available; this keeps their contract asynchronous, like a real HTTP gateway.
 *
 * @param value - Value the gateway resolves with.
 */
export function respondWith<T>(value: T): Observable<T> {
  const latency = environment.apiLatencyMs;
  return latency > 0 ? of(value).pipe(delay(latency)) : of(value);
}
