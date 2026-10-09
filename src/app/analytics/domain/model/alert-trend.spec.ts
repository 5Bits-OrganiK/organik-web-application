import {DomainError} from '../../../shared/domain/model/domain-error';
import {AlertTrend} from './alert-trend';

const weekly = (counts: number[]) =>
  new AlertTrend(counts.map((count, index) => ({label: `S${index + 1}`, count})));

describe('AlertTrend', () => {
  it('should report the highest count as the peak', () => {
    expect(weekly([8, 12, 9, 17, 14, 21]).peak).toBe(21);
    expect(weekly([]).peak).toBe(0);
  });

  it('should flag only the periods that grew sharply over the previous one', () => {
    const trend = weekly([8, 12, 9, 17, 14, 21]);
    const spikes = trend.points.map((_, index) => trend.isSpike(index));

    expect(spikes).toEqual([false, false, false, true, false, false]);
  });

  it('should never flag the first period', () => {
    expect(weekly([50, 1]).isSpike(0)).toBe(false);
  });

  it('should reject counts that are not non-negative integers', () => {
    expect(() => weekly([3, -1])).toThrow(DomainError);
    expect(() => weekly([2.5])).toThrow(DomainError);
  });
});
