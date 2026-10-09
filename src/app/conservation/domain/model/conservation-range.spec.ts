import {DomainError} from '../../../shared/domain/model/domain-error';
import {ConservationRange} from './conservation-range';

describe('ConservationRange', () => {
  const fresh = ConservationRange.forCondition('fresh');

  it('should accept readings inside the range', () => {
    expect(fresh.evaluate(6, 70)).toBe('normal');
    expect(fresh.evaluate(8, 85)).toBe('normal');
  });

  it('should warn when a reading is slightly outside the range', () => {
    expect(fresh.evaluate(9, 72)).toBe('warning');
    expect(fresh.evaluate(2, 70)).toBe('warning');
    expect(fresh.evaluate(6, 90)).toBe('warning');
  });

  it('should be critical when a reading is far outside the range', () => {
    expect(fresh.evaluate(12, 72)).toBe('critical');
    expect(fresh.evaluate(6, 40)).toBe('critical');
  });

  it('should provide a sensible range for every storage condition', () => {
    expect(ConservationRange.forCondition('cold').evaluate(4, 61)).toBe('normal');
    expect(ConservationRange.forCondition('dry').evaluate(19, 45)).toBe('normal');
    expect(ConservationRange.forCondition('frozen').evaluate(-18, 55)).toBe('normal');
  });

  it('should reject inverted or impossible ranges', () => {
    expect(() => new ConservationRange(8, 4, 50, 60)).toThrow(DomainError);
    expect(() => new ConservationRange(2, 6, 50, 120)).toThrow(DomainError);
  });
});
