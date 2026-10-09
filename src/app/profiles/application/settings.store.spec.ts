import {TestBed} from '@angular/core/testing';
import {DomainError} from '../../shared/domain/model/domain-error';
import {SettingsStore} from './settings.store';

describe('SettingsStore', () => {
  let store: SettingsStore;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    store = TestBed.inject(SettingsStore);
  });

  afterEach(() => localStorage.clear());

  it('should start with the default thresholds', () => {
    expect(store.expirationPolicy().criticalDays).toBe(3);
    expect(store.expirationPolicy().riskDays).toBe(7);
  });

  it('should apply and remember new thresholds', () => {
    store.saveExpirationPolicy(2, 10);

    expect(store.expirationPolicy().statusFor(9)).toBe('risk');
    expect(JSON.parse(localStorage.getItem('organik.expiration-policy') ?? '{}')).toEqual({
      criticalDays: 2,
      riskDays: 10
    });
  });

  it('should restore the thresholds saved in a previous visit', () => {
    localStorage.setItem('organik.expiration-policy', JSON.stringify({criticalDays: 1, riskDays: 5}));

    store.restore();

    expect(store.expirationPolicy().criticalDays).toBe(1);
    expect(store.expirationPolicy().riskDays).toBe(5);
  });

  it('should ignore saved thresholds that are not valid', () => {
    localStorage.setItem('organik.expiration-policy', JSON.stringify({criticalDays: 9, riskDays: 2}));

    store.restore();

    expect(store.expirationPolicy().riskDays).toBe(7);
  });

  it('should refuse invalid thresholds', () => {
    expect(() => store.saveExpirationPolicy(7, 7)).toThrow(DomainError);
  });
});
