import {CalendarDate} from '../../../shared/domain/model/calendar-date';
import {DateTime} from '../../../shared/domain/model/date-time';
import {DomainError} from '../../../shared/domain/model/domain-error';
import {ReadingSource} from './reading-source';
import {ReadingStatus} from './reading-status';
import {StorageZone} from './storage-zone.entity';

/**
 * Represents one sensor measurement taken in a storage zone.
 */
export class StorageReading {
  /**
   * @param zoneId - Zone where the measurement was taken.
   * @param productId - SKU of the product stored in the zone being monitored.
   * @param temperature - Temperature in °C.
   * @param humidity - Relative humidity in %, from 0 to 100.
   * @param recordedAt - Moment of the measurement.
   * @param source - Whether the value comes from a sensor or from a simulation.
   * @throws DomainError if the humidity is outside 0–100 %.
   */
  constructor(
    readonly zoneId: string,
    readonly productId: string,
    readonly temperature: number,
    readonly humidity: number,
    readonly recordedAt: DateTime,
    readonly source: ReadingSource = 'simulated'
  ) {
    if (humidity < 0 || humidity > 100) {
      throw new DomainError('Humidity must be between 0 and 100 %');
    }
  }

  /**
   * Day of the measurement.
   */
  takenOn(): CalendarDate {
    return CalendarDate.of(this.recordedAt.toDisplayString().slice(0, 10));
  }

  /**
   * Whether the measurement was taken inside a range of days (both limits included).
   *
   * @param from - First day, or `null` for no lower limit.
   * @param to - Last day, or `null` for no upper limit.
   */
  isTakenBetween(from: CalendarDate | null, to: CalendarDate | null): boolean {
    const day = this.takenOn();
    return (!from || !day.isBefore(from)) && (!to || !to.isBefore(day));
  }

  /**
   * Compares the measurement with the range of its zone.
   *
   * @param zone - Zone where the measurement was taken.
   */
  statusIn(zone: StorageZone): ReadingStatus {
    return zone.range.evaluate(this.temperature, this.humidity);
  }
}
