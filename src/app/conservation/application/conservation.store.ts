import {computed, inject, Injectable, signal} from '@angular/core';
import {ProductsStore} from '../../products/application/products.store';
import {InventoryStore} from '../../inventory/application/inventory.store';
import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {DateTime} from '../../shared/domain/model/date-time';
import {ConservationAlert} from '../domain/model/conservation-alert';
import {ReadingSource} from '../domain/model/reading-source';
import {ReadingStatus} from '../domain/model/reading-status';
import {StorageReading} from '../domain/model/storage-reading.entity';
import {StorageZone} from '../domain/model/storage-zone.entity';
import {ConservationAlertService} from '../domain/services/conservation-alert.service';
import {ConservationApi} from '../infrastructure/conservation-api';

/** Read model of one row of the monitoring table. */
export interface ReadingItem {
  zoneId: string;
  zoneName: string;
  productName: string;
  temperature: number;
  humidity: number;
  recordedAt: DateTime;
  status: ReadingStatus;
  source: ReadingSource;
}

/** Filters of the reading history; a `null` limit leaves that side open. */
export interface ReadingFilter {
  zoneId: string | null;
  from: string | null;
  to: string | null;
}

@Injectable({providedIn: 'root'})
/**
 * Application service that coordinates the state of the Conservation bounded context.
 *
 * @remarks
 * Besides monitoring zones, it derives the active alerts from the sensor readings and
 * from the expirations and shortages reported by the inventory.
 */
export class ConservationStore {
  private readonly api = inject(ConservationApi);
  private readonly productsStore = inject(ProductsStore);
  private readonly inventory = inject(InventoryStore);
  private readonly alertService = new ConservationAlertService();

  private readonly zonesSignal = signal<StorageZone[]>([]);
  private readonly readingsSignal = signal<StorageReading[]>([]);
  private loaded = false;

  /** Storage zones, to choose one when the history is filtered. */
  readonly zones = this.zonesSignal.asReadonly();

  /** Every reading with its zone and status, the most recent first. */
  private readonly allItems = computed<ReadingItem[]>(() =>
    [...this.readingsSignal()]
      .sort((a, b) => b.recordedAt.toString().localeCompare(a.recordedAt.toString()))
      .flatMap(reading => {
        const zone = this.zonesSignal().find(candidate => candidate.id === reading.zoneId);
        return zone
          ? [
              {
                zoneId: zone.id,
                zoneName: zone.name,
                productName: this.productsStore.findProduct(reading.productId)?.name ?? reading.productId,
                temperature: reading.temperature,
                humidity: reading.humidity,
                recordedAt: reading.recordedAt,
                status: reading.statusIn(zone),
                source: reading.source
              }
            ]
          : [];
      })
  );

  /** Rows of the monitoring table: the latest reading of each storage zone. */
  readonly readingItems = computed<ReadingItem[]>(() => {
    const latest = new Map<string, ReadingItem>();
    for (const item of this.allItems()) {
      if (!latest.has(item.zoneId)) {
        latest.set(item.zoneId, item);
      }
    }
    return this.zonesSignal().flatMap(zone => latest.get(zone.id) ?? []);
  });

  /** Names of the zones that have no readings yet. */
  readonly zonesWithoutReadings = computed(() => {
    const withReadings = new Set(this.allItems().map(item => item.zoneId));
    return this.zonesSignal().filter(zone => !withReadings.has(zone.id)).map(zone => zone.name);
  });

  /** Active alerts, in the order they are presented in the analytics screen. */
  readonly alerts = computed<ConservationAlert[]>(() =>
    this.alertService.derive({
      expiringProducts: this.inventory.expiringItems().map(item => item.productName),
      outOfRangeZones: this.readingItems()
        .filter(item => item.status !== 'normal')
        .map(item => item.zoneName),
      shortageProducts: this.inventory.shortages().map(shortage => shortage.productName)
    })
  );

  /** Active alerts with the most urgent first; ties keep their presentation order. */
  readonly prioritizedAlerts = computed(() =>
    [...this.alerts()].sort(
      (a, b) => Number(b.severity === 'critical') - Number(a.severity === 'critical')
    )
  );

  /** Number of active alerts. */
  readonly alertCount = computed(() => this.alerts().length);

  /**
   * Readings of the history that match the filters, the most recent first.
   *
   * @param filter - Zone and range of days; an empty field means no limit.
   */
  history(filter: ReadingFilter): ReadingItem[] {
    const from = filter.from ? CalendarDate.of(filter.from) : null;
    const to = filter.to ? CalendarDate.of(filter.to) : null;
    const taken = new Map(this.readingsSignal().map(reading => [reading.recordedAt.toString() + reading.zoneId, reading]));
    return this.allItems().filter(item => {
      const reading = taken.get(item.recordedAt.toString() + item.zoneId);
      return (!filter.zoneId || item.zoneId === filter.zoneId) && (reading?.isTakenBetween(from, to) ?? false);
    });
  }

  /**
   * Loads zones, readings and the inventory the alerts depend on, once.
   */
  loadConservation(): void {
    this.inventory.loadInventory();
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    this.api.getZones().subscribe(zones => this.zonesSignal.set(zones));
    this.api.getReadings().subscribe(readings => this.readingsSignal.set(readings));
  }
}
