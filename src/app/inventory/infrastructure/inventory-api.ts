import {inject, Injectable} from '@angular/core';
import {map, Observable, switchMap} from 'rxjs';
import {Clock} from '../../shared/domain/services/clock';
import {FakeApi, mergeByKey} from '../../shared/infrastructure/fake-api';
import {respondWith} from '../../shared/infrastructure/in-memory-gateway';
import {InventoryEvent} from '../domain/model/inventory-event';
import {Offer} from '../domain/model/offer.entity';
import {StockLot} from '../domain/model/stock-lot.entity';
import {InventoryEventAssembler} from './inventory-event-assembler';
import {InventoryEventResource, OfferResource, StockLotResource} from './inventory-response';
import {inventoryEventsSeed, offersSeed, stockLotsSeed} from './inventory-seed';
import {OfferAssembler} from './offer-assembler';
import {StockLotAssembler} from './stock-lot-assembler';

@Injectable({providedIn: 'root'})
/**
 * Infrastructure gateway to the inventory backend.
 *
 * @remarks
 * Until the backend exists, resources are kept in memory. The gateway still returns
 * domain entities by delegating resource mapping to the assemblers. Stock lots are also
 * read from and stored in the fake REST API when it is available.
 */
export class InventoryApi {
  private readonly assembler = inject(StockLotAssembler);
  private readonly eventAssembler = inject(InventoryEventAssembler);
  private readonly offerAssembler = inject(OfferAssembler);
  private readonly fakeApi = inject(FakeApi);
  private readonly resources: StockLotResource[];
  private readonly eventResources: InventoryEventResource[];
  private readonly offerResources: OfferResource[];

  constructor() {
    const today = inject(Clock).today();
    this.resources = stockLotsSeed(today);
    this.eventResources = inventoryEventsSeed(today);
    this.offerResources = offersSeed(today);
  }

  /**
   * Fetches every stock lot.
   */
  getStockLots(): Observable<StockLot[]> {
    return this.fakeApi.list<StockLotResource>('inventory').pipe(
      switchMap(remote => {
        const merged = mergeByKey(this.resources, remote, resource => resource.lotCode);
        this.resources.splice(0, this.resources.length, ...merged);
        return respondWith({lots: structuredClone(merged)});
      }),
      map(response => this.assembler.toEntitiesFromResponse(response))
    );
  }

  /**
   * Persists a newly received lot.
   *
   * @param lot - Lot entity to store.
   */
  createStockLot(lot: StockLot): Observable<StockLot> {
    const resource = this.assembler.toResourceFromEntity(lot);
    this.resources.push(resource);
    return this.fakeApi.create('inventory', resource).pipe(switchMap(() => respondWith(lot)));
  }

  /**
   * Replaces the stored version of a lot.
   *
   * @param lot - Updated lot entity.
   */
  updateStockLot(lot: StockLot): Observable<StockLot> {
    const index = this.resources.findIndex(resource => resource.lotCode === lot.lotCode);
    this.resources[index] = this.assembler.toResourceFromEntity(lot);
    return respondWith(lot);
  }

  /**
   * Fetches the inventory history.
   */
  getEvents(): Observable<InventoryEvent[]> {
    return respondWith({events: structuredClone(this.eventResources)}).pipe(
      map(response => this.eventAssembler.toEntitiesFromResponse(response))
    );
  }

  /**
   * Persists an inventory event.
   *
   * @param event - Event entity to store.
   */
  createEvent(event: InventoryEvent): Observable<InventoryEvent> {
    this.eventResources.push(this.eventAssembler.toResourceFromEntity(event));
    return respondWith(event);
  }

  /**
   * Fetches every offer.
   */
  getOffers(): Observable<Offer[]> {
    return respondWith({offers: structuredClone(this.offerResources)}).pipe(
      map(response => this.offerAssembler.toEntitiesFromResponse(response))
    );
  }

  /**
   * Persists an offer.
   *
   * @param offer - Offer entity to store.
   */
  createOffer(offer: Offer): Observable<Offer> {
    this.offerResources.push(this.offerAssembler.toResourceFromEntity(offer));
    return respondWith(offer);
  }
}
