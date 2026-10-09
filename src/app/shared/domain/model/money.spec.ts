import {DomainError} from './domain-error';
import {Money} from './money';

describe('Money', () => {
  it('should format whole amounts without decimals', () => {
    expect(Money.of(1820).format('es-PE').replace(/\s/g, ' ')).toBe('S/ 1,820');
  });

  it('should keep cents for fractional amounts', () => {
    expect(Money.of(12.5).format('es-PE').replace(/\s/g, ' ')).toBe('S/ 12.50');
  });

  it('should reject negative amounts', () => {
    expect(() => Money.of(-1)).toThrow(DomainError);
  });
});
