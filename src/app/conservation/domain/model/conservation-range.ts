import {DomainError} from '../../../shared/domain/model/domain-error';
import {StorageCondition} from '../../../shared/domain/model/storage-condition';
import {ReadingStatus} from './reading-status';

/** Degrees Celsius a reading may leave the range before it becomes critical. */
const TEMPERATURE_TOLERANCE = 2;
/** Humidity points a reading may leave the range before it becomes critical. */
const HUMIDITY_TOLERANCE = 10;

/**
 * Value object with the temperature and humidity a storage zone must keep.
 */
export class ConservationRange {
  /**
   * @throws DomainError if a minimum exceeds its maximum or humidity is outside 0–100 %.
   */
  constructor(
    readonly minTemperature: number,
    readonly maxTemperature: number,
    readonly minHumidity: number,
    readonly maxHumidity: number
  ) {
    if (minTemperature > maxTemperature || minHumidity > maxHumidity) {
      throw new DomainError('A minimum cannot exceed its maximum');
    }
    if (minHumidity < 0 || maxHumidity > 100) {
      throw new DomainError('Humidity must be between 0 and 100 %');
    }
  }

  /** Recommended range for each storage condition. */
  static forCondition(condition: StorageCondition): ConservationRange {
    switch (condition) {
      case 'cold':
        return new ConservationRange(2, 6, 55, 75);
      case 'fresh':
        return new ConservationRange(4, 8, 60, 85);
      case 'dry':
        return new ConservationRange(15, 22, 35, 55);
      case 'frozen':
        return new ConservationRange(-22, -16, 40, 70);
    }
  }

  /**
   * Compares a reading with the range.
   *
   * @param temperature - Temperature in °C.
   * @param humidity - Relative humidity in %.
   */
  evaluate(temperature: number, humidity: number): ReadingStatus {
    const temperatureGap = ConservationRange.gap(temperature, this.minTemperature, this.maxTemperature);
    const humidityGap = ConservationRange.gap(humidity, this.minHumidity, this.maxHumidity);
    if (temperatureGap === 0 && humidityGap === 0) {
      return 'normal';
    }
    return temperatureGap <= TEMPERATURE_TOLERANCE && humidityGap <= HUMIDITY_TOLERANCE
      ? 'warning'
      : 'critical';
  }

  /** Distance between a value and the interval; zero when inside it. */
  private static gap(value: number, min: number, max: number): number {
    if (value < min) {
      return min - value;
    }
    return value > max ? value - max : 0;
  }
}
