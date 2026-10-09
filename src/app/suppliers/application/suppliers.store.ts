import {computed, inject, Injectable, signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {SessionStore} from '../../iam/application/session.store';
import {ProductsStore} from '../../products/application/products.store';
import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {DomainError} from '../../shared/domain/model/domain-error';
import {EmailAddress} from '../../shared/domain/model/email-address';
import {Quantity} from '../../shared/domain/model/quantity';
import {Clock} from '../../shared/domain/services/clock';
import {OfferedProduct} from '../domain/model/offered-product.entity';
import {Supplier} from '../domain/model/supplier.entity';
import {SupplierSuggestionService} from '../domain/services/supplier-suggestion.service';
import {SuppliersApi} from '../infrastructure/suppliers-api';

/**
 * Data collected by the "new supplier" form.
 */
export interface RegisterSupplierCommand {
  businessName: string;
  contactName: string;
  phone: string;
  email: string;
  /** Comma-separated product categories. */
  categories: string;
  organicCertification: string;
}

/**
 * Data collected by the "offer a product" form of a supplier.
 */
export interface OfferingCommand {
  /** SKU of the product in the catalog. */
  productId: string;
  lotCode: string;
  availableQuantity: number;
  /** Expiration day of the lot in ISO-8601 format (`yyyy-MM-dd`). */
  expiresOn: string;
}

/** Read model of one product a supplier offers. */
export interface OfferingItem {
  id: string;
  supplierId: string;
  supplierName: string;
  productId: string;
  productName: string;
  lotCode: string;
  availableQuantity: number;
  expiresOn: CalendarDate;
  updatedOn: CalendarDate;
}

@Injectable({providedIn: 'root'})
/**
 * Application service that coordinates the state of the Suppliers bounded context.
 *
 * @remarks
 * It owns the supplier list and exposes it through Angular signals consumed by
 * presentation components of this and other contexts.
 */
export class SuppliersStore {
  private readonly api = inject(SuppliersApi);
  private readonly suggestionService = new SupplierSuggestionService();
  private readonly productsStore = inject(ProductsStore);
  private readonly session = inject(SessionStore);
  private readonly clock = inject(Clock);

  private readonly suppliersSignal = signal<Supplier[]>([]);
  private readonly offeredSignal = signal<OfferedProduct[]>([]);
  private loaded = false;

  /** Read-only projection of the known suppliers. */
  readonly suppliers = this.suppliersSignal.asReadonly();

  /** Suppliers grouped by the alert situation they are recommended for. */
  readonly suggestions = computed(() => this.suggestionService.suggest(this.suppliersSignal()));

  /** Every product the suppliers offer, with the product and the supplier names. */
  readonly offerings = computed<OfferingItem[]>(() =>
    this.offeredSignal().map(offered => ({
      id: offered.id,
      supplierId: offered.supplierId,
      supplierName: this.findById(offered.supplierId)?.businessName ?? offered.supplierId,
      productId: offered.productId,
      productName: this.productsStore.findProduct(offered.productId)?.name ?? offered.productId,
      lotCode: offered.lotCode,
      availableQuantity: offered.availableQuantity.value,
      expiresOn: offered.expiresOn,
      updatedOn: offered.updatedOn
    }))
  );

  /** The products offered by the supplier company of the signed-in user. */
  readonly myOfferings = computed(() => {
    const supplierId = this.session.currentUser()?.supplierId ?? null;
    return supplierId ? this.offerings().filter(offering => offering.supplierId === supplierId) : [];
  });

  /**
   * Products one supplier offers.
   *
   * @param supplierId - Supplier identifier.
   */
  offeringsOf(supplierId: string): OfferingItem[] {
    return this.offerings().filter(offering => offering.supplierId === supplierId);
  }

  /**
   * Finds an offered product by identifier.
   *
   * @param id - Identifier of the entry.
   */
  findOffering(id: string): OfferedProduct | undefined {
    return this.offeredSignal().find(offered => offered.id === id);
  }

  /**
   * Loads the suppliers once; later calls reuse the cached list.
   */
  loadSuppliers(): void {
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    this.productsStore.loadProducts();
    this.api.getSuppliers().subscribe(suppliers => this.suppliersSignal.set(suppliers));
    this.api.getOfferedProducts().subscribe(offered => this.offeredSignal.set(offered));
  }

  /**
   * Finds a supplier by identifier in the loaded list.
   *
   * @param id - Supplier identifier.
   */
  findById(id: string): Supplier | undefined {
    return this.suppliersSignal().find(supplier => supplier.id === id);
  }

  /**
   * Registers a new supplier and adds it to the list.
   *
   * @param command - Data collected by the form.
   * @param id - Identifier of the supplier; a new one is generated when omitted.
   * @throws DomainError if the data violates a supplier invariant.
   */
  registerSupplier(command: RegisterSupplierCommand, id = `sup-${crypto.randomUUID().slice(0, 8)}`): Observable<Supplier> {
    const supplier = new Supplier({
      id,
      businessName: command.businessName,
      contactName: command.contactName,
      phone: command.phone,
      email: new EmailAddress(command.email),
      categories: command.categories.split(','),
      organicCertification: command.organicCertification,
      specialties: []
    });
    return this.api
      .createSupplier(supplier)
      .pipe(tap(created => this.suppliersSignal.update(current => [...current, created])));
  }

  /**
   * Publishes a product in the catalog of the supplier company of the signed-in user.
   *
   * @param command - Data collected by the form.
   * @throws DomainError if the user is not a supplier or the data violates an invariant.
   */
  registerOffering(command: OfferingCommand): Observable<OfferedProduct> {
    const supplierId = this.requireSupplierId();
    const highest = this.offeredSignal().reduce((max, offered) => Math.max(max, Number(offered.id.replace(/^\D+/, '').replace(/^p-/, '')) || 0), 0);
    const offered = new OfferedProduct({
      id: `off-p-${highest + 1}`,
      supplierId,
      productId: command.productId,
      lotCode: command.lotCode,
      availableQuantity: Quantity.of(command.availableQuantity),
      expiresOn: CalendarDate.of(command.expiresOn),
      updatedOn: this.clock.today()
    });
    return this.api
      .createOfferedProduct(offered)
      .pipe(tap(created => this.offeredSignal.update(current => [...current, created])));
  }

  /**
   * Updates the lot, the availability or the expiration of a product the signed-in supplier offers.
   *
   * @param id - Identifier of the entry.
   * @param command - Data collected by the form.
   * @throws DomainError if the entry does not exist, belongs to another supplier or the data is invalid.
   */
  updateOffering(id: string, command: OfferingCommand): Observable<OfferedProduct> {
    const supplierId = this.requireSupplierId();
    const existing = this.findOffering(id);
    if (!existing) {
      throw new DomainError(`Offered product ${id} does not exist`);
    }
    if (!existing.belongsTo(supplierId)) {
      throw new DomainError('Only the supplier that offers a product can change it');
    }
    const updated = existing.update(
      {lotCode: command.lotCode, availableQuantity: Quantity.of(command.availableQuantity), expiresOn: CalendarDate.of(command.expiresOn)},
      this.clock.today()
    );
    return this.api
      .updateOfferedProduct(updated)
      .pipe(tap(saved => this.offeredSignal.update(current => current.map(offered => (offered.id === saved.id ? saved : offered)))));
  }

  private requireSupplierId(): string {
    const supplierId = this.session.currentUser()?.supplierId ?? null;
    if (!supplierId) {
      throw new DomainError('Only a supplier can manage a catalog');
    }
    return supplierId;
  }
}
