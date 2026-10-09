import {provideHttpClient} from '@angular/common/http';
import {HttpTestingController, provideHttpClientTesting} from '@angular/common/http/testing';
import {TestBed} from '@angular/core/testing';
import {environment} from '../../../environments/environment';
import {FAKE_API_ENABLED, FakeApi, mergeByKey} from './fake-api';

describe('mergeByKey', () => {
  const keyOf = (item: {id: string}) => item.id;

  it('should keep the local objects when the API gave nothing', () => {
    expect(mergeByKey([{id: 'a'}], null, keyOf)).toEqual([{id: 'a'}]);
    expect(mergeByKey([{id: 'a'}], [], keyOf)).toEqual([{id: 'a'}]);
  });

  it('should let remote objects replace local ones and append the new ones', () => {
    const local = [{id: 'a', n: 1}, {id: 'b', n: 1}];
    const remote = [{id: 'b', n: 2}, {id: 'c', n: 2}];

    expect(mergeByKey(local, remote, keyOf)).toEqual([{id: 'a', n: 1}, {id: 'b', n: 2}, {id: 'c', n: 2}]);
  });
});

describe('FakeApi', () => {
  const url = (collection: string) => `${environment.api.baseUrl}/${collection}`;
  let api: FakeApi;
  let http: HttpTestingController;

  describe('when it is switched on', () => {
    beforeEach(() => {
      localStorage.clear();
      TestBed.configureTestingModule({
        providers: [provideHttpClient(), provideHttpClientTesting(), {provide: FAKE_API_ENABLED, useValue: true}]
      });
      api = TestBed.inject(FakeApi);
      http = TestBed.inject(HttpTestingController);
    });

    it('should read a collection', () => {
      let result: unknown = 'pending';
      api.list('products').subscribe(items => (result = items));
      http.expectOne(url('products')).flush([{id: 'ORG-01'}]);

      expect(result).toEqual([{id: 'ORG-01'}]);
    });

    it('should answer null instead of failing when the API errors or answers something else', () => {
      const results: unknown[] = [];
      api.list('products').subscribe(items => results.push(items));
      http.expectOne(url('products')).flush('quota', {status: 429, statusText: 'Too Many Requests'});
      api.list('inventory').subscribe(items => results.push(items));
      http.expectOne(url('inventory')).flush('Hey ya! nothing is configured');

      expect(results).toEqual([null, null]);
    });

    it('should reuse an answer instead of asking again, until something is created', () => {
      const results: unknown[] = [];
      api.list('products').subscribe(items => results.push(items));
      http.expectOne(url('products')).flush([{id: 'ORG-01'}]);
      api.list('products').subscribe(items => results.push(items));
      http.expectNone(url('products'));

      api.create('products', {id: 'ORG-08'}).subscribe();
      http.expectOne(url('products')).flush({id: 'ORG-08'});
      api.list('products').subscribe(items => results.push(items));
      http.expectOne(url('products')).flush([{id: 'ORG-01'}, {id: 'ORG-08'}]);

      expect(results).toEqual([[{id: 'ORG-01'}], [{id: 'ORG-01'}], [{id: 'ORG-01'}, {id: 'ORG-08'}]]);
    });

    it('should report whether a create was accepted', () => {
      const results: boolean[] = [];
      api.create('inventory', {lotCode: 'LT-1'}).subscribe(ok => results.push(ok));
      const request = http.expectOne(url('inventory'));
      expect(request.request.method).toBe('POST');
      request.flush({lotCode: 'LT-1'});
      api.create('inventory', {lotCode: 'LT-2'}).subscribe(ok => results.push(ok));
      http.expectOne(url('inventory')).flush('x', {status: 500, statusText: 'Server Error'});

      expect(results).toEqual([true, false]);
    });
  });

  it('should remember an answer in the browser so a reload does not ask again', () => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), {provide: FAKE_API_ENABLED, useValue: true}]
    });
    TestBed.inject(FakeApi).list('products').subscribe();
    TestBed.inject(HttpTestingController).expectOne(url('products')).flush([{id: 'ORG-01'}]);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), {provide: FAKE_API_ENABLED, useValue: true}]
    });
    let result: unknown;
    TestBed.inject(FakeApi).list('products').subscribe(items => (result = items));

    expect(result).toEqual([{id: 'ORG-01'}]);
    TestBed.inject(HttpTestingController).verify();
    localStorage.clear();
  });

  it('should stay silent when it is switched off', () => {
    TestBed.configureTestingModule({providers: [provideHttpClient(), provideHttpClientTesting()]});
    api = TestBed.inject(FakeApi);
    http = TestBed.inject(HttpTestingController);
    const results: unknown[] = [];
    api.list('products').subscribe(items => results.push(items));
    api.create('products', {}).subscribe(ok => results.push(ok));

    expect(results).toEqual([null, false]);
    http.verify();
  });
});
