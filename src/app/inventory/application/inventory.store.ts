import {computed, inject, Injectable, signal} from '@angular/core';
import {forkJoin, map, Observable, of, switchMap, tap} from 'rxjs';
import {SessionStore} from '../../iam/application/session.store';
import {ProductsStore} from '../../products/application/products.store';
import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {DomainError} from '../../shared/domain/model/domain-error';
import {Quantity} from '../../shared/domain/model/quantity';
import {Clock} from '../../shared/domain/services/clock';
import {ExpirationPolicy} from '../domain/model/expiration-policy';
import {InventoryEvent, InventoryEventType, WasteCause} from '../domain/model/inventory-event';
import {Offer} from '../domain/model/offer.entity';
import {StockLot} from '../domain/model/stock-lot.entity';
import {InventoryApi} from '../infrastructure/inventory-api';
import {InventoryEventItem, InventoryItem, OfferItem, StockShortage} from './inventory-item';

/**
 * Data collected by the "register stock" form.
 */
export interface RegisterStockCommand {
  productId: string;
  lotCode: string;
  quantity: number;
  /** Expiration day in ISO-8601 format (`yyyy-MM-dd`). */
  expiresOn: string;
  location: string;
  notes: string;
}

/**
 * Data collected by the "edit lot" form.
 */
export interface UpdateLotCommand {
  lotCode: string;
  quantity: number;
  /** Expiration day in ISO-8601 format (`yyyy-MM-dd`). */
  expiresOn: string;
  location: string;
  notes: string;
}

/**
 * Data collected by the "register waste" form.
 */
export interface RegisterWasteCommand {
  lotCode: string;
  quantity: number;
  cause: WasteCause;
}

/**
 * Data collected by the "register offer" form.
 */
export interface RegisterOfferCommand {
  productId: string;
  quantity: number;
  /** Last day of the offer in ISO-8601 format (`yyyy-MM-dd`). */
  validUntil: string;
}

/**
 * One line of an accepted order that enters the inventory as a lot.
 */
export interface ReceivedLine {
  productId: string;
  quantity: number;
  lotCode: string;
  /** Expiration day in ISO-8601 format (`yyyy-MM-dd`). */
  expiresOn: string;
}

@Injectable({providedIn: 'root'})
/**
 * Application service that coordinates the state of the Inventory bounded context.
 *
 * @remarks
 * It joins stock lots with the products to build the read models consumed by the
 * presentation layer and by other contexts (conservation alerts, dashboard). Every change of the
 * inventory is recorded in a history with its author and its day.
 */
export class InventoryStore {
  private readonly api = inject(InventoryApi);
  private readonly productsStore = inject(ProductsStore);
  private readonly session = inject(SessionStore);
  private readonly clock = inject(Clock);

  private readonly lotsSignal = signal<StockLot[]>([]);
  private readonly eventsSignal = signal<InventoryEvent[]>([]);
  private readonly offersSignal = signal<Offer[]>([]);
  private readonly policySignal = signal(ExpirationPolicy.default());
  private loaded = false;

  /** Policy that classifies lots by their remaining shelf life. */
  readonly policy = this.policySignal.asReadonly();

  /** Inventory rows: every lot with its product and expiration status. */
  readonly items = computed<InventoryItem[]>(() => {
    const today = this.clock.today();
    const policy = this.policySignal();
    return this.lotsSignal().map(lot => ({
      sku: lot.productId,
      productName: this.productsStore.findProduct(lot.productId)?.name ?? lot.productId,
      categoryId: this.productsStore.findProduct(lot.productId)?.categoryId ?? '',
      lotCode: lot.lotCode,
      quantity: lot.quantity.value,
      expiresOn: lot.expiresOn,
      daysToExpire: lot.daysToExpire(today),
      status: lot.statusOn(today, policy),
      location: lot.location
    }));
  });

  /** Total units available across every lot. */
  readonly totalUnits = computed(() =>
    this.lotsSignal().reduce((total, lot) => total.plus(lot.quantity), Quantity.zero()).value
  );

  /** Lots that are close to expiring or already critical. */
  readonly expiringItems = computed(() => this.items().filter(item => item.status !== 'normal'));

  /** Products whose total stock is under their configured minimum. */
  readonly shortages = computed<StockShortage[]>(() =>
    this.productsStore.products().flatMap(product => {
      const stock = this.lotsSignal()
        .filter(lot => lot.productId === product.id)
        .reduce((total, lot) => total.plus(lot.quantity), Quantity.zero());
      return product.isBelowMinimum(stock)
        ? [{sku: product.id, productName: product.name, stock: stock.value, minimum: product.minimumStock.value}]
        : [];
    })
  );

  /** Inventory history, the most recent movement first. */
  readonly events = computed<InventoryEventItem[]>(() =>
    [...this.eventsSignal()]
      .sort((a, b) => b.occurredOn.toString().localeCompare(a.occurredOn.toString()) || b.id.localeCompare(a.id, undefined, {numeric: true}))
      .map(event => ({
        id: event.id,
        type: event.type,
        productName: this.productsStore.findProduct(event.productId)?.name ?? event.productId,
        lotCode: event.lotCode,
        quantity: event.quantity?.value ?? null,
        cause: event.cause,
        detail: event.detail,
        actorName: event.actorName,
        occurredOn: event.occurredOn
      }))
  );

  /** Offers registered by the minimarket, the most recent first. */
  readonly offers = computed<OfferItem[]>(() => {
    const today = this.clock.today();
    return [...this.offersSignal()]
      .reverse()
      .map(offer => ({
        id: offer.id,
        productName: this.productsStore.findProduct(offer.productId)?.name ?? offer.productId,
        quantity: offer.quantity.value,
        validUntil: offer.validUntil,
        createdBy: offer.createdBy,
        active: offer.isActiveOn(today)
      }));
  });

  /**
   * Loads the stock lots, the history and the offers (and the products they refer to) once.
   */
  loadInventory(): void {
    this.productsStore.loadProducts();
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    this.api.getStockLots().subscribe(lots => this.lotsSignal.set(lots));
    this.api.getEvents().subscribe(events => this.eventsSignal.set(events));
    this.api.getOffers().subscribe(offers => this.offersSignal.set(offers));
  }

  /**
   * Whether a lot code is already registered.
   *
   * @param lotCode - Code to look for; the comparison ignores case and spaces.
   */
  hasLot(lotCode: string): boolean {
    const normalized = lotCode.trim().toUpperCase();
    return this.lotsSignal().some(lot => lot.lotCode === normalized);
  }

  /**
   * Finds a lot by its code in the loaded list.
   *
   * @param lotCode - Code of the lot.
   */
  findLot(lotCode: string): StockLot | undefined {
    const normalized = lotCode.trim().toUpperCase();
    return this.lotsSignal().find(lot => lot.lotCode === normalized);
  }

  /**
   * Rows of the inventory that belong to one product.
   *
   * @param productId - SKU of the product.
   */
  lotsOf(productId: string): InventoryItem[] {
    return this.items().filter(item => item.sku === productId);
  }

  /**
   * Units available of a product across its lots.
   *
   * @param productId - SKU of the product.
   */
  stockOf(productId: string): number {
    return this.lotsOf(productId).reduce((total, item) => total + item.quantity, 0);
  }

  /**
   * Registers a received lot.
   *
   * @param command - Data collected by the form.
   * @throws DomainError if the lot already exists, is already expired or violates an invariant.
   */
  registerStock(command: RegisterStockCommand): Observable<StockLot> {
    if (this.hasLot(command.lotCode)) {
      throw new DomainError(`Lot ${command.lotCode} is already registered`);
    }
    const expiresOn = CalendarDate.of(command.expiresOn);
    if (expiresOn.isBefore(this.clock.today())) {
      throw new DomainError('A received lot cannot be already expired');
    }
    const lot = new StockLot({
      lotCode: command.lotCode,
      productId: command.productId,
      quantity: Quantity.of(command.quantity),
      expiresOn,
      location: command.location,
      notes: command.notes
    });
    return this.api.createStockLot(lot).pipe(
      tap(created => this.lotsSignal.update(current => [...current, created])),
      switchMap(created =>
        this.record('registered', created.productId, created.lotCode, created.quantity.value, '', 'Lot received').pipe(map(() => created))
      )
    );
  }

  /**
   * Updates the editable data of a lot and records the change.
   *
   * @param command - Data collected by the form.
   * @throws DomainError if the lot does not exist or the data is invalid (for example a negative quantity).
   */
  updateLot(command: UpdateLotCommand): Observable<StockLot> {
    const lot = this.requireLot(command.lotCode);
    const revised = lot.revise({
      quantity: Quantity.of(command.quantity),
      expiresOn: CalendarDate.of(command.expiresOn),
      location: command.location,
      notes: command.notes
    });
    const changes = [
      lot.quantity.equals(revised.quantity) ? '' : `quantity ${lot.quantity.value} -> ${revised.quantity.value}`,
      lot.expiresOn.equals(revised.expiresOn) ? '' : `expiration ${lot.expiresOn} -> ${revised.expiresOn}`,
      lot.location === revised.location ? '' : `location ${lot.location} -> ${revised.location}`,
      lot.notes === revised.notes ? '' : 'notes'
    ].filter(Boolean);
    return this.replaceLot(revised).pipe(
      switchMap(updated =>
        this.record('updated', updated.productId, updated.lotCode, null, '', changes.join(', ') || 'No changes').pipe(map(() => updated))
      )
    );
  }

  /**
   * Registers units lost from a lot (waste) and discounts them from the stock.
   *
   * @param command - Data collected by the form.
   * @throws DomainError if the lot does not exist or the units exceed what the lot holds.
   */
  registerWaste(command: RegisterWasteCommand): Observable<StockLot> {
    const lot = this.requireLot(command.lotCode);
    const units = Quantity.of(command.quantity);
    const remaining = lot.discard(units);
    return this.replaceLot(remaining).pipe(
      switchMap(updated =>
        this.record('waste', updated.productId, updated.lotCode, units.value, command.cause, `${units.value} units lost`).pipe(map(() => updated))
      )
    );
  }

  /**
   * Puts units of a product on offer. The offer does not discount the stock.
   *
   * @param command - Data collected by the form.
   * @throws DomainError if the product has fewer units than offered or the offer is invalid.
   */
  registerOffer(command: RegisterOfferCommand): Observable<Offer> {
    const units = Quantity.of(command.quantity);
    if (units.value > this.stockOf(command.productId)) {
      throw new DomainError('An offer cannot have more units than the available stock');
    }
    const offer = new Offer({
      id: `off-${this.offersSignal().length + 1}`,
      productId: command.productId,
      quantity: units,
      validUntil: CalendarDate.of(command.validUntil),
      createdBy: this.actorName(),
      createdOn: this.clock.today()
    });
    return this.api.createOffer(offer).pipe(
      tap(created => this.offersSignal.update(current => [...current, created])),
      switchMap(created =>
        this.record('offer', created.productId, null, units.value, '', `Offer valid until ${created.validUntil}`).pipe(map(() => created))
      )
    );
  }

  /**
   * Adds the lines of an accepted order to the inventory as new lots.
   *
   * @param orderId - Identifier of the accepted order, kept in the history.
   * @param lines - Products, quantities and lots that enter the inventory.
   */
  receiveOrder(orderId: string, lines: readonly ReceivedLine[]): Observable<void> {
    if (!lines.length) {
      return of(undefined);
    }
    const lots = lines.map(
      line =>
        new StockLot({
          lotCode: this.freeLotCode(line.lotCode),
          productId: line.productId,
          quantity: Quantity.of(line.quantity),
          expiresOn: CalendarDate.of(line.expiresOn),
          location: 'Reception',
          notes: `Order ${orderId}`
        })
    );
    return forkJoin(lots.map(lot => this.api.createStockLot(lot))).pipe(
      tap(created => this.lotsSignal.update(current => [...current, ...created])),
      switchMap(created =>
        forkJoin(
          created.map(lot => this.record('order-received', lot.productId, lot.lotCode, lot.quantity.value, '', `Order ${orderId} accepted`))
        )
      ),
      map(() => undefined)
    );
  }

  /**
   * Records in the history that the data of a product was changed.
   *
   * @param productId - SKU of the product.
   * @param detail - Description of the change.
   */
  recordProductChange(productId: string, detail: string): Observable<InventoryEvent> {
    return this.record('product-updated', productId, null, null, '', detail);
  }

  /**
   * Replaces the expiration policy, e.g. after the administrator changes the settings.
   *
   * @param policy - New policy.
   */
  updatePolicy(policy: ExpirationPolicy): void {
    this.policySignal.set(policy);
  }

  private requireLot(lotCode: string): StockLot {
    const lot = this.findLot(lotCode);
    if (!lot) {
      throw new DomainError(`Lot ${lotCode} does not exist`);
    }
    return lot;
  }

  private replaceLot(lot: StockLot): Observable<StockLot> {
    return this.api
      .updateStockLot(lot)
      .pipe(tap(updated => this.lotsSignal.update(current => current.map(item => (item.lotCode === updated.lotCode ? updated : item)))));
  }

  /** Lot code that is not in use yet, adding a suffix when the requested one exists. */
  private freeLotCode(lotCode: string): string {
    let code = lotCode.trim().toUpperCase();
    for (let suffix = 2; this.hasLot(code) || this.lotsSignal().some(lot => lot.lotCode === code); suffix++) {
      code = `${lotCode.trim().toUpperCase()}-${suffix}`;
    }
    return code;
  }

  private actorName(): string {
    return this.session.currentUser()?.fullName ?? 'System';
  }

  private record(
    type: InventoryEventType,
    productId: string,
    lotCode: string | null,
    quantity: number | null,
    cause: string,
    detail: string
  ): Observable<InventoryEvent> {
    const highest = this.eventsSignal().reduce((max, event) => Math.max(max, Number(event.id.replace(/^\D+/, '')) || 0), 0);
    const event = new InventoryEvent({
      id: `evt-${highest + 1}`,
      type,
      productId,
      lotCode,
      quantity: quantity === null ? null : Quantity.of(quantity),
      cause,
      detail,
      actorName: this.actorName(),
      occurredOn: this.clock.today()
    });
    return this.api.createEvent(event).pipe(tap(created => this.eventsSignal.update(current => [...current, created])));
  }
}
