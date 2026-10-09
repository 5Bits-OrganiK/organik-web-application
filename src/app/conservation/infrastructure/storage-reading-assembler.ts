import {Injectable} from '@angular/core';
import {DateTime} from '../../shared/domain/model/date-time';
import {READING_SOURCES} from '../domain/model/reading-source';
import {StorageReading} from '../domain/model/storage-reading.entity';
import {StorageReadingResource, StorageReadingsResponse} from './conservation-response';

/**
 * Maps sensor reading resources from the backend into StorageReading domain entities.
 */
@Injectable({providedIn: 'root'})
export class StorageReadingAssembler {
  /**
   * Converts a reading resource into a StorageReading entity.
   *
   * @param resource - Raw reading object returned by the backend.
   */
  toEntityFromResource(resource: StorageReadingResource): StorageReading {
    return new StorageReading(
      resource.zoneId,
      resource.productId,
      resource.temperature,
      resource.humidity,
      new DateTime(resource.recordedAt),
      READING_SOURCES.find(source => source === resource.source) ?? 'simulated'
    );
  }

  /**
   * Converts a readings payload into StorageReading entities.
   *
   * @param response - Backend response with reading resources.
   */
  toEntitiesFromResponse(response: StorageReadingsResponse): StorageReading[] {
    return response.readings.map(resource => this.toEntityFromResource(resource));
  }
}
