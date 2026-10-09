import {computed, inject, Injectable, signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {DomainError} from '../../shared/domain/model/domain-error';
import {Quantity} from '../../shared/domain/model/quantity';
import {Clock} from '../../shared/domain/services/clock';
import {ProductsStore} from '../../products/application/products.store';
import {SessionStore} from '../../iam/application/session.store';
import {SuppliersStore} from '../../suppliers/application/suppliers.store';
import {RequestPriority, RequestStatus, SupplyRequest} from '../domain/model/supply-request.entity';
import {RequisitionApi} from '../infrastructure/requisition-api';

/**
 * Data collected by the "new request" form.
 */
export interface CreateSupplyRequestCommand {
  productId: string;
  supplierId: string;
  quantity: number;
  reason: string;
  /** Required day in ISO-8601 format (`yyyy-MM-dd`). */
  requiredOn: string;
  priority: RequestPriority;
}

/** Read model of one row of the supply requests table. */
export interface SupplyRequestItem {
  id: string;
  productName: string;
  supplierName: string;
  quantity: number;
  reason: string;
  status: RequestStatus;
}

@Injectable({providedIn: 'root'})
/**
 * Application service that coordinates the state of the Requisition bounded context.
 *
 * @remarks
 * A supply request is a need the minimarket shares with a supplier; it is not an order and it
 * never changes the inventory. The store joins requests with the products and the suppliers to
 * build the read models consumed by the presentation layer, the dashboard and the reports.
 */
export class RequisitionStore {
  private readonly api = inject(RequisitionApi);
  private readonly productsStore = inject(ProductsStore);
  private readonly suppliers = inject(SuppliersStore);
  private readonly clock = inject(Clock);
  private readonly session = inject(SessionStore);

  private readonly requestsSignal = signal<SupplyRequest[]>([]);
  private loaded = false;

  /** Requests the signed-in user may see: a supplier the ones addressed to it, a minimarket its own. */
  private readonly visibleRequests = computed(() => {
    const user = this.session.currentUser();
    return this.requestsSignal().filter(
      request => !user || (user.supplierId ? request.supplierId === user.supplierId : request.minimarketId === user.minimarketId)
    );
  });

  /** Number of supply requests the signed-in user can see. */
  readonly requestCount = computed(() => this.visibleRequests().length);

  /** Rows of the supply requests table. */
  readonly requestItems = computed<SupplyRequestItem[]>(() =>
    this.visibleRequests().map(request => ({
      id: request.id,
      productName: this.productName(request.productId),
      supplierName: this.supplierName(request.supplierId),
      quantity: request.quantity.value,
      reason: request.reason,
      status: request.status
    }))
  );

  /** The most recently created request that a supplier accepted, if any. */
  readonly latestAcceptedRequest = computed(() =>
    this.requestItems().filter(request => request.status === 'accepted').at(-1)
  );

  /**
   * Loads the requests (and the data they refer to) once.
   */
  loadRequisition(): void {
    this.productsStore.loadProducts();
    this.suppliers.loadSuppliers();
    this.session.loadSession();
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    this.api.getSupplyRequests().subscribe(requests => this.requestsSignal.set(requests));
  }

  /**
   * Sends a new supply request to a supplier.
   *
   * @param command - Data collected by the form.
   * @throws DomainError if the data violates a request invariant or the required day is past.
   */
  createSupplyRequest(command: CreateSupplyRequestCommand): Observable<SupplyRequest> {
    const user = this.session.currentUser();
    if (user?.supplierId) {
      throw new DomainError('A supplier can consult the requests but cannot create them');
    }
    const requiredOn = CalendarDate.of(command.requiredOn);
    if (requiredOn.isBefore(this.clock.today())) {
      throw new DomainError('The required date cannot be in the past');
    }
    const request = new SupplyRequest({
      id: this.nextRequestId(),
      productId: command.productId,
      supplierId: command.supplierId,
      minimarketId: user?.minimarketId || 'mm-vida-verde',
      quantity: Quantity.of(command.quantity),
      reason: command.reason,
      requiredOn,
      priority: command.priority,
      status: 'pending'
    });
    return this.api
      .createSupplyRequest(request)
      .pipe(tap(created => this.requestsSignal.update(current => [...current, created])));
  }

  private productName(productId: string): string {
    return this.productsStore.findProduct(productId)?.name ?? productId;
  }

  private supplierName(supplierId: string): string {
    return this.suppliers.findById(supplierId)?.businessName ?? supplierId;
  }

  /** Identifier that follows the highest one in use, e.g. `req-6`. */
  private nextRequestId(): string {
    const highest = this.requestsSignal()
      .map(request => Number(request.id.replace(/^\D+/, '')))
      .reduce((max, value) => (Number.isFinite(value) ? Math.max(max, value) : max), 0);
    return `req-${highest + 1}`;
  }
}
