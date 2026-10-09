import {DomainError} from './domain-error';
import {Percentage} from './percentage';

describe('Percentage', () => {
  it('should print the value followed by the percent sign', () => {
    expect(Percentage.of(72).toString()).toBe('72%');
  });

  it('should accept the limits', () => {
    expect(Percentage.of(0).value).toBe(0);
    expect(Percentage.of(100).value).toBe(100);
  });

  it('should reject values outside 0–100', () => {
    expect(() => Percentage.of(-1)).toThrow(DomainError);
    expect(() => Percentage.of(101)).toThrow(DomainError);
    expect(() => Percentage.of(Number.NaN)).toThrow(DomainError);
  });
});
