import {HttpClient} from '@angular/common/http';
import {inject, Injectable, InjectionToken} from '@angular/core';
import {catchError, map, Observable, of, shareReplay, tap, timeout} from 'rxjs';
import {environment} from '../../../environments/environment';

/**
 * Switch that lets the application talk to the fake API. It is off by default so that unit tests and
 * any other injector stay in memory; `app.config.ts` turns it on.
 */
export const FAKE_API_ENABLED = new InjectionToken<boolean>('FAKE_API_ENABLED', {factory: () => false});

/**
 * Client of the fake REST API (Beeceptor) that stands in for the OrganiK web services.
 *
 * @remarks
 * Every call is best effort: when the API is switched off, unreachable or out of quota, the
 * methods answer `null` / `false` instead of failing, so the gateways keep working with
 * their in-memory data. The free Beeceptor plan keeps very few objects (about twelve in
 * total) and answers a limited number of requests per day, so the gateways always merge
 * what the API returns with their local seed. Answers are cached for `environment.api.cacheMs`
 * (also when they failed) and remembered in this browser, so neither navigating around nor reloading
 * the page spends the daily quota.
 */
@Injectable({providedIn: 'root'})
export class FakeApi {
  private readonly http = inject(HttpClient);

  private readonly cache = new Map<string, {at: number; result: Observable<unknown[] | null>}>();

  /** Whether requests are sent to the fake API at all. */
  readonly enabled = inject(FAKE_API_ENABLED) && environment.api.baseUrl !== '';

  /**
   * Reads every object of a collection.
   *
   * @param collection - Collection path, e.g. `products`.
   * @returns The objects, or `null` when the API cannot be used.
   */
  list<T>(collection: string): Observable<T[] | null> {
    if (!this.enabled) {
      return of(null);
    }
    const cached = this.cache.get(collection);
    if (cached && Date.now() - cached.at < environment.api.cacheMs) {
      return cached.result as Observable<T[] | null>;
    }
    const stored = this.readStored(collection);
    if (stored) {
      const result = of(stored.data);
      this.cache.set(collection, {at: stored.at, result});
      return result as Observable<T[] | null>;
    }
    const result = this.http.get<unknown>(this.url(collection)).pipe(
      timeout(environment.api.timeoutMs),
      map(body => (Array.isArray(body) ? (body as unknown[]) : null)),
      catchError(() => of(null)),
      tap(data => this.writeStored(collection, data)),
      shareReplay({bufferSize: 1, refCount: false})
    );
    this.cache.set(collection, {at: Date.now(), result});
    return result as Observable<T[] | null>;
  }

  /**
   * Stores a new object in a collection.
   *
   * @param collection - Collection path, e.g. `products`.
   * @param body - Object to store.
   * @returns Whether the API accepted the object.
   */
  create(collection: string, body: object): Observable<boolean> {
    if (!this.enabled) {
      return of(false);
    }
    return this.http.post(this.url(collection), body).pipe(
      timeout(environment.api.timeoutMs),
      map(() => true),
      catchError(() => of(false)),
      tap(accepted => {
        if (accepted) {
          this.cache.delete(collection);
          this.clearStored(collection);
        }
      })
    );
  }

  private storageKey(collection: string): string {
    return `organik.fake-api.${collection}`;
  }

  private readStored(collection: string): {at: number; data: unknown[] | null} | null {
    try {
      const stored = JSON.parse(localStorage.getItem(this.storageKey(collection)) ?? 'null') as {at: number; data: unknown[] | null} | null;
      return stored && Date.now() - stored.at < environment.api.cacheMs ? stored : null;
    } catch {
      return null;
    }
  }

  private writeStored(collection: string, data: unknown[] | null): void {
    try {
      localStorage.setItem(this.storageKey(collection), JSON.stringify({at: Date.now(), data}));
    } catch {
      // Storage can be unavailable; the in-memory cache still applies.
    }
  }

  private clearStored(collection: string): void {
    try {
      localStorage.removeItem(this.storageKey(collection));
    } catch {
      // Nothing to clear.
    }
  }

  private url(collection: string): string {
    return `${environment.api.baseUrl.replace(/\/$/, '')}/${collection}`;
  }
}

/**
 * Merges what the API returned into the local seed: remote objects replace local ones with the same
 * key and extra remote objects are appended.
 *
 * @param local - Objects the gateway already has.
 * @param remote - Objects returned by the API, or `null` when it could not be used.
 * @param keyOf - Identifier of an object.
 */
export function mergeByKey<T>(local: readonly T[], remote: readonly T[] | null, keyOf: (item: T) => string): T[] {
  if (!remote?.length) {
    return [...local];
  }
  const remoteByKey = new Map(remote.map(item => [keyOf(item), item]));
  const merged = local.map(item => remoteByKey.get(keyOf(item)) ?? item);
  const known = new Set(local.map(keyOf));
  return [...merged, ...remote.filter(item => !known.has(keyOf(item)))];
}
