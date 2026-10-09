import {DomainError} from './domain-error';
import {Quantity} from './quantity';

describe('Quantity', () => {
  it('should only accept non-negative integers', () => {
    expect(() => Quantity.of(-1)).toThrow(DomainError);
    expect(() => Quantity.of(1.5)).toThrow(DomainError);
    expect(Quantity.of(0).value).toBe(0);
  });

  it('should add quantities without mutating operands', () => {
    const base = Quantity.of(24);
    expect(base.plus(Quantity.of(6)).value).toBe(30);
    expect(base.value).toBe(24);
  });

  it('should compare quantities', () => {
    expect(Quantity.of(5).isLessThan(Quantity.of(10))).toBe(true);
    expect(Quantity.of(5).equals(Quantity.of(5))).toBe(true);
  });

  it('should subtract units and refuse to go below zero', () => {
    expect(Quantity.of(10).minus(Quantity.of(4)).value).toBe(6);
    expect(() => Quantity.of(2).minus(Quantity.of(3))).toThrow(DomainError);
    expect(Quantity.of(4).isMoreThan(Quantity.of(3))).toBe(true);
  });
});
