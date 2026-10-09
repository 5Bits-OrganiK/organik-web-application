import {computed, inject, Injectable, signal} from '@angular/core';
import {map, Observable, switchMap, tap} from 'rxjs';
import {InventoryStore} from '../../inventory/application/inventory.store';
import {SessionStore} from '../../iam/application/session.store';
import {ProductsStore} from '../../products/application/products.store';
import {SuppliersStore} from '../../suppliers/application/suppliers.store';
import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {DomainError} from '../../shared/domain/model/domain-error';
import {Quantity} from '../../shared/domain/model/quantity';
import {Clock} from '../../shared/domain/services/clock';
import {ShipmentLine} from '../domain/model/shipment-line';
import {OrderStatus, ShipmentOrder} from '../domain/model/shipment-order.entity';
import {ProcurementsApi} from '../infrastructure/procurements-api';
import {LINKED_MINIMARKETS} from '../infrastructure/procurements-seed';

/** One product a supplier asks to send, taken from its own catalog. */
export interface OrderLineCommand {
  /** Catalog entry the units come from. */
  offeringId: string;
  quantity: number;
}

/**
 * Data collected by the "create order" form.
 */
export interface CreateOrderCommand {
  minimarketId: string;
  lines: readonly OrderLineCommand[];
}

/** Read model of one line of an order. */
export interface OrderLineItem {
  productId: string;
  productName: string;
  quantity: number;
  lotCode: string;
  expiresOn: CalendarDate;
}

/** Read model of one order. */
export interface ShipmentOrderItem {
  id: string;
  supplierId: string;
  supplierName: string;
  minimarketId: string;
  minimarketName: string;
  productNames: string;
  lines: OrderLineItem[];
  createdOn: CalendarDate;
  createdBy: string;
  status: OrderStatus;
  /** Units ordered across every line. */
  totalQuantity: number;
  decidedBy: string;
  decidedOn: CalendarDate | null;
  reason: string;
}

@Injectable({providedIn: 'root'})
/**
 * Application service that coordinates the state of the Procurements bounded context.
 *
 * @remarks
 * Procurements manages the orders a supplier sends to a minimarket and the decision of the administrator
 * who receives them. A supplier sees its own orders, the people of a minimarket see the ones addressed to it.
 * Creating an order never changes the inventory; accepting it adds its units exactly once.
 */
export class ProcurementsStore {
  private readonly api = inject(ProcurementsApi);
  private readonly productsStore = inject(ProductsStore);
  private readonly suppliers = inject(SuppliersStore);
  private readonly inventory = inject(InventoryStore);
  private readonly session = inject(SessionStore);
  private readonly clock = inject(Clock);

  private readonly shipmentsSignal = signal<ShipmentOrder[]>([]);
  private loaded = false;

  /** Orders the signed-in user may see: the ones of its supplier or the ones addressed to its minimarket. */
  readonly shipmentItems = computed<ShipmentOrderItem[]>(() => {
    const user = this.session.currentUser();
    return this.shipmentsSignal()
      .filter(order => !user || (user.supplierId ? order.supplierId === user.supplierId : order.minimarketId === user.minimarketId))
      .map(order => this.toShipmentItem(order))
      .sort((a, b) => b.createdOn.toString().localeCompare(a.createdOn.toString()) || b.id.localeCompare(a.id));
  });

  /** Orders waiting for an answer. */
  readonly pendingItems = computed(() => this.shipmentItems().filter(item => item.status === 'pending'));

  /** How many orders wait for an answer. */
  readonly pendingCount = computed(() => this.pendingItems().length);

  /** Minimarkets the signed-in supplier can send orders to. */
  readonly linkedMinimarkets = LINKED_MINIMARKETS;

  /**
   * Loads the orders (and the data they refer to) once.
   */
  loadProcurements(): void {
    this.productsStore.loadProducts();
    this.suppliers.loadSuppliers();
    this.inventory.loadInventory();
    this.session.loadSession();
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    this.api.getShipmentOrders().subscribe(shipments => this.shipmentsSignal.set(shipments));
  }

  /**
   * Finds the read model of an order the signed-in user may see.
   *
   * @param id - Order identifier.
   */
  findItem(id: string): ShipmentOrderItem | undefined {
    return this.shipmentItems().find(item => item.id === id);
  }

  /**
   * Whether the signed-in user is the administrator who decides on an order.
   *
   * @param orderId - Order identifier.
   */
  canDecide(orderId: string): boolean {
    const order = this.shipmentsSignal().find(candidate => candidate.id === orderId);
    const user = this.session.currentUser();
    return !!order && !!user && order.isPending && user.canDecideOrders && user.minimarketId === order.minimarketId;
  }

  /**
   * Creates a pending order from the catalog of the signed-in supplier.
   *
   * @param command - Data collected by the form.
   * @throws DomainError if the user is not a supplier, the minimarket is not linked, a product is not in
   * the catalog of the supplier or more units are asked than are available.
   */
  createOrder(command: CreateOrderCommand): Observable<ShipmentOrder> {
    const user = this.session.currentUser();
    if (!user?.supplierId) {
      throw new DomainError('Only a supplier can create an order');
    }
    if (!this.linkedMinimarkets.some(minimarket => minimarket.id === command.minimarketId)) {
      throw new DomainError('The minimarket is not linked with the supplier');
    }
    const lines = command.lines.map(line => {
      const offered = this.suppliers.findOffering(line.offeringId);
      if (!offered?.belongsTo(user.supplierId)) {
        throw new DomainError('The product is not in the catalog of the supplier');
      }
      const quantity = Quantity.of(line.quantity);
      if (!offered.canSupply(quantity)) {
        throw new DomainError(`Only ${offered.availableQuantity.value} units of ${offered.productId} are available`);
      }
      return new ShipmentLine(offered.productId, quantity, offered.lotCode, offered.expiresOn);
    });
    const order = new ShipmentOrder({
      id: this.nextId(),
      supplierId: user.supplierId,
      minimarketId: command.minimarketId,
      lines,
      createdOn: this.clock.today(),
      createdBy: user.fullName,
      status: 'pending'
    });
    return this.api.createShipmentOrder(order).pipe(tap(created => this.shipmentsSignal.update(current => [...current, created])));
  }

  /**
   * Accepts an order and adds its units to the inventory of the minimarket.
   *
   * @param orderId - Order identifier.
   * @throws DomainError if the signed-in user does not decide on the order or it was already answered.
   */
  acceptOrder(orderId: string): Observable<ShipmentOrder> {
    const order = this.requireDecidable(orderId);
    const accepted = order.accept(this.session.currentUser()!.fullName, this.clock.today());
    return this.save(accepted).pipe(
      switchMap(saved =>
        this.inventory
          .receiveOrder(
            saved.id,
            saved.lines.map(line => ({
              productId: line.productId,
              quantity: line.quantity.value,
              lotCode: line.lotCode,
              expiresOn: line.expiresOn.toString()
            }))
          )
          .pipe(map(() => saved))
      )
    );
  }

  /**
   * Rejects an order with a reason; the inventory is not touched.
   *
   * @param orderId - Order identifier.
   * @param reason - Why the order is rejected.
   * @throws DomainError if the signed-in user does not decide on the order, it was answered or there is no reason.
   */
  rejectOrder(orderId: string, reason: string): Observable<ShipmentOrder> {
    const order = this.requireDecidable(orderId);
    return this.save(order.reject(this.session.currentUser()!.fullName, this.clock.today(), reason));
  }

  private requireDecidable(orderId: string): ShipmentOrder {
    const order = this.shipmentsSignal().find(candidate => candidate.id === orderId);
    if (!order) {
      throw new DomainError(`Order ${orderId} does not exist`);
    }
    const user = this.session.currentUser();
    if (!user?.canDecideOrders || user.minimarketId !== order.minimarketId) {
      throw new DomainError('Only the administrator of the destination minimarket can answer an order');
    }
    return order;
  }

  private save(order: ShipmentOrder): Observable<ShipmentOrder> {
    return this.api
      .updateShipmentOrder(order)
      .pipe(tap(updated => this.shipmentsSignal.update(current => current.map(o => (o.id === updated.id ? updated : o)))));
  }

  private nextId(): string {
    const highest = this.shipmentsSignal().reduce((max, order) => Math.max(max, Number(order.id.replace(/^\D+/, '')) || 0), 0);
    return `ord-${String(highest + 1).padStart(2, '0')}`;
  }

  private toShipmentItem(order: ShipmentOrder): ShipmentOrderItem {
    const lines = order.lines.map(line => ({
      productId: line.productId,
      productName: this.productName(line.productId),
      quantity: line.quantity.value,
      lotCode: line.lotCode,
      expiresOn: line.expiresOn
    }));
    return {
      id: order.id,
      supplierId: order.supplierId,
      supplierName: this.suppliers.findById(order.supplierId)?.businessName ?? order.supplierId,
      minimarketId: order.minimarketId,
      minimarketName: this.linkedMinimarkets.find(minimarket => minimarket.id === order.minimarketId)?.name ?? order.minimarketId,
      productNames: lines.map(line => line.productName).join(', '),
      lines,
      createdOn: order.createdOn,
      createdBy: order.createdBy,
      status: order.status,
      totalQuantity: order.totalQuantity.value,
      decidedBy: order.decision?.decidedBy ?? '',
      decidedOn: order.decision?.decidedOn ?? null,
      reason: order.decision?.reason ?? ''
    };
  }

  private productName(productId: string): string {
    return this.productsStore.findProduct(productId)?.name ?? productId;
  }
}
