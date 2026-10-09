import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {Clock} from '../../shared/domain/services/clock';
import {respondWith} from '../../shared/infrastructure/in-memory-gateway';
import {StorageReading} from '../domain/model/storage-reading.entity';
import {StorageZone} from '../domain/model/storage-zone.entity';
import {readingsSeed, ZONES_SEED} from './conservation-seed';
import {StorageReadingAssembler} from './storage-reading-assembler';
import {StorageZoneAssembler} from './storage-zone-assembler';

@Injectable({providedIn: 'root'})
/**
 * Infrastructure gateway to the conservation backend (zones and sensors).
 *
 * @remarks
 * Until the backend exists, resources are kept in memory. The gateway still returns
 * domain entities by delegating resource mapping to assembler classes.
 */
export class ConservationApi {
  private readonly zoneAssembler = inject(StorageZoneAssembler);
  private readonly readingAssembler = inject(StorageReadingAssembler);
  private readonly clock = inject(Clock);

  /**
   * Fetches every storage zone.
   */
  getZones(): Observable<StorageZone[]> {
    return respondWith({zones: structuredClone(ZONES_SEED)}).pipe(
      map(response => this.zoneAssembler.toEntitiesFromResponse(response))
    );
  }

  /**
   * Fetches the readings of every storage zone, including the history of the last week.
   */
  getReadings(): Observable<StorageReading[]> {
    return respondWith({readings: readingsSeed(this.clock.today())}).pipe(
      map(response => this.readingAssembler.toEntitiesFromResponse(response))
    );
  }
}
