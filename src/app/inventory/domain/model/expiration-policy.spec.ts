import {DomainError} from '../../../shared/domain/model/domain-error';
import {ExpirationPolicy} from './expiration-policy';

describe('ExpirationPolicy', () => {
  const policy = ExpirationPolicy.default();

  it('should classify lots by remaining days', () => {
    expect(policy.statusFor(10)).toBe('normal');
    expect(policy.statusFor(7)).toBe('risk');
    expect(policy.statusFor(4)).toBe('risk');
    expect(policy.statusFor(3)).toBe('critical');
    expect(policy.statusFor(0)).toBe('critical');
  });

  it('should treat expired lots as critical', () => {
    expect(policy.statusFor(-5)).toBe('critical');
  });

  it('should reject thresholds that are not increasing', () => {
    expect(() => new ExpirationPolicy(7, 7)).toThrow(DomainError);
    expect(() => new ExpirationPolicy(-1, 5)).toThrow(DomainError);
    expect(() => new ExpirationPolicy(2.5, 7)).toThrow(DomainError);
  });
});
