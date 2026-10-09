import {Injectable} from '@angular/core';
import {STORAGE_CONDITIONS} from '../../shared/domain/model/storage-condition';
import {StorageZone} from '../domain/model/storage-zone.entity';
import {StorageZoneResource, StorageZonesResponse} from './conservation-response';

/**
 * Maps storage zone resources from the backend into StorageZone domain entities.
 */
@Injectable({providedIn: 'root'})
export class StorageZoneAssembler {
  /**
   * Converts a zone resource into a StorageZone entity.
   *
   * @param resource - Raw zone object returned by the backend.
   */
  toEntityFromResource(resource: StorageZoneResource): StorageZone {
    const condition = STORAGE_CONDITIONS.find(candidate => candidate === resource.condition) ?? 'fresh';
    return new StorageZone(resource.id, resource.name, condition);
  }

  /**
   * Converts a zones payload into StorageZone entities.
   *
   * @param response - Backend response with zone resources.
   */
  toEntitiesFromResponse(response: StorageZonesResponse): StorageZone[] {
    return response.zones.map(resource => this.toEntityFromResource(resource));
  }
}
