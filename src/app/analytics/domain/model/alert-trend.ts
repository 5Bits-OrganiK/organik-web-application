import {DomainError} from '../../../shared/domain/model/domain-error';

/**
 * Number of alerts raised in one period.
 */
export interface AlertTrendPoint {
  /** Short label of the period, e.g. `S1` for the first week. */
  label: string;
  /** Alerts raised in the period. */
  count: number;
}

/** Growth over the previous period from which a point is considered a spike. */
const SPIKE_GROWTH = 0.6;

/**
 * Series of alerts raised per period, used to spot abnormal growth.
 */
export class AlertTrend {
  /**
   * @param points - Periods in chronological order.
   * @throws DomainError if a count is not a non-negative integer.
   */
  constructor(readonly points: readonly AlertTrendPoint[]) {
    if (points.some(point => !Number.isInteger(point.count) || point.count < 0)) {
      throw new DomainError('Alert counts must be non-negative integers');
    }
  }

  /** Highest count of the series; zero when it is empty. */
  get peak(): number {
    return this.points.reduce((peak, point) => Math.max(peak, point.count), 0);
  }

  /**
   * Whether a period grew sharply compared with the one before it.
   *
   * @param index - Position of the period in the series.
   */
  isSpike(index: number): boolean {
    const previous = this.points[index - 1]?.count;
    const current = this.points[index]?.count;
    return previous !== undefined && current !== undefined && previous > 0
      && current > previous * (1 + SPIKE_GROWTH);
  }
}
