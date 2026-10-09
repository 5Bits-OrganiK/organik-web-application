import {inject, Injectable, signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {DomainError} from '../../shared/domain/model/domain-error';
import {Quantity} from '../../shared/domain/model/quantity';
import {StorageCondition} from '../../shared/domain/model/storage-condition';
import {MeasurementUnit} from '../domain/model/measurement-unit';
import {Product} from '../domain/model/product.entity';
import {ProductCategory} from '../domain/model/product-category';
import {ProductsApi} from '../infrastructure/products-api';

/**
 * Data collected by the "add product" form.
 */
export interface AddProductCommand {
  name: string;
  categoryId: string;
  supplierId: string;
  unit: MeasurementUnit;
  minimumStock: number;
  storageCondition: StorageCondition;
}

@Injectable({providedIn: 'root'})
/**
 * Application service that coordinates the state of the Products bounded context.
 */
export class ProductsStore {
  private readonly api = inject(ProductsApi);

  private readonly categoriesSignal = signal<ProductCategory[]>([]);
  private readonly productsSignal = signal<Product[]>([]);
  private loaded = false;

  /** Read-only projection of the product categories. */
  readonly categories = this.categoriesSignal.asReadonly();
  /** Read-only projection of the catalog products. */
  readonly products = this.productsSignal.asReadonly();

  /**
   * Loads categories and products once; later calls reuse the cached data.
   */
  loadProducts(): void {
    if (this.loaded) {
      return;
    }
    this.loaded = true;
    this.api.getCategories().subscribe(categories => this.categoriesSignal.set(categories));
    this.api.getProducts().subscribe(products => this.productsSignal.set(products));
  }

  /**
   * Finds a product by SKU in the loaded catalog.
   *
   * @param id - Product SKU.
   */
  findProduct(id: string): Product | undefined {
    return this.productsSignal().find(product => product.id === id);
  }

  /**
   * Adds a product to the catalog, assigning it the next SKU.
   *
   * @param command - Data collected by the form.
   * @throws DomainError if the data violates a product invariant.
   */
  addProduct(command: AddProductCommand): Observable<Product> {
    const product = new Product({
      id: this.nextSku(),
      name: command.name,
      categoryId: command.categoryId,
      supplierId: command.supplierId,
      unit: command.unit,
      minimumStock: Quantity.of(command.minimumStock),
      storageCondition: command.storageCondition
    });
    return this.api
      .createProduct(product)
      .pipe(tap(created => this.productsSignal.update(current => [...current, created])));
  }

  /**
   * Updates the editable data of a product.
   *
   * @param id - SKU of the product.
   * @param command - Data collected by the form.
   * @throws DomainError if the product does not exist or the data violates an invariant.
   */
  updateProduct(id: string, command: AddProductCommand): Observable<Product> {
    const existing = this.findProduct(id);
    if (!existing) {
      throw new DomainError(`Product ${id} does not exist`);
    }
    const revised = existing.revise({
      name: command.name,
      categoryId: command.categoryId,
      supplierId: command.supplierId,
      unit: command.unit,
      minimumStock: Quantity.of(command.minimumStock),
      storageCondition: command.storageCondition
    });
    return this.api
      .updateProduct(revised)
      .pipe(tap(updated => this.productsSignal.update(current => current.map(product => (product.id === updated.id ? updated : product)))));
  }

  /** SKU that follows the highest one in the catalog, e.g. `ORG-08`. */
  private nextSku(): string {
    const highest = this.productsSignal()
      .map(product => Number(product.id.replace(/^\D+/, '')))
      .reduce((max, value) => (Number.isFinite(value) ? Math.max(max, value) : max), 0);
    return `ORG-${String(highest + 1).padStart(2, '0')}`;
  }
}
