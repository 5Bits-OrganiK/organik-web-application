import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {InventoryStore} from '../../../../inventory/application/inventory.store';
import {CalendarDate} from '../../../../shared/domain/model/calendar-date';
import {STORAGE_CONDITIONS, StorageCondition} from '../../../../shared/domain/model/storage-condition';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {SuppliersStore} from '../../../../suppliers/application/suppliers.store';
import {ProductsStore} from '../../../application/products.store';
import {MEASUREMENT_UNITS, MeasurementUnit} from '../../../domain/model/measurement-unit';
import {POSITIVE_INTEGER_PATTERN} from '../../../../shared/presentation/forms/form-patterns';

@Component({
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButton,
    MatFormField,
    MatError,
    MatInput,
    TranslatePipe,
    FormCard
  ],
  selector: 'app-product-form',
  styleUrl: './product-form.css',
  templateUrl: './product-form.html',
})
/**
 * View to add a product to the catalog with its initial stock, or to edit an existing product.
 */
export class ProductForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productsStore = inject(ProductsStore);
  private readonly suppliersStore = inject(SuppliersStore);
  private readonly inventory = inject(InventoryStore);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);
  private readonly route = inject(ActivatedRoute);

  /** SKU of the product to edit, read from the route; empty when a product is added. */
  protected readonly id = signal<string | undefined>(undefined);

  protected readonly editing = computed(() => !!this.id());
  protected readonly categories = this.productsStore.categories;
  protected readonly suppliers = this.suppliersStore.suppliers;
  protected readonly units = MEASUREMENT_UNITS;
  protected readonly storageConditions = STORAGE_CONDITIONS;
  /** First day the initial lot may expire. */
  protected readonly minExpiry = CalendarDate.today().toString();

  protected readonly form = this.fb.group({
    name: new FormControl('', {nonNullable: true, validators: Validators.required}),
    categoryId: new FormControl('', {nonNullable: true, validators: Validators.required}),
    supplierId: new FormControl('', {nonNullable: true, validators: Validators.required}),
    unit: new FormControl<MeasurementUnit>('unit', {nonNullable: true, validators: Validators.required}),
    minimumStock: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(POSITIVE_INTEGER_PATTERN)]}),
    storageCondition: new FormControl<StorageCondition | ''>('', {nonNullable: true, validators: Validators.required}),
    initialQuantity: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(POSITIVE_INTEGER_PATTERN)]}),
    initialExpiresOn: new FormControl('', {nonNullable: true, validators: [Validators.required, control => control.value && CalendarDate.of(control.value).isBefore(CalendarDate.today()) ? {expired: true} : null]}),
    initialLocation: new FormControl('Main storage', {nonNullable: true, validators: Validators.required})
  });

  constructor() {
    this.route.params.subscribe(params => {
      this.id.set(params['id']);
      if (params['id']) {
        for (const control of ['initialQuantity', 'initialExpiresOn', 'initialLocation'] as const) {
          this.form.controls[control].disable({emitEvent: false});
        }
        // Fill the form once the product to edit is available.
        this.productsStore.loadProducts().subscribe(() => this.fill());
      }
    });
  }

  private fill(): void {
    const id = this.id();
    const product = id ? this.productsStore.findProduct(id) : undefined;
    if (product) {
      this.form.patchValue({
        name: product.name,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        unit: product.unit,
        minimumStock: String(product.minimumStock.value),
        storageCondition: product.storageCondition
      });
    }
  }

  ngOnInit(): void {
    this.productsStore.loadProducts();
    this.suppliersStore.loadSuppliers();
    this.inventory.loadInventory();
  }

  /**
   * Saves the product (and its initial lot when it is new) and goes back to the products.
   */
  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const data = {
      name: value.name,
      categoryId: value.categoryId,
      supplierId: value.supplierId,
      unit: value.unit,
      minimumStock: Number(value.minimumStock),
      storageCondition: value.storageCondition as StorageCondition
    };
    const id = this.id();
    if (id) {
      this.productsStore.updateProduct(id, data).subscribe(product => {
        this.inventory.recordProductChange(product.id, `Updated ${product.name}`).subscribe();
        this.notifier.success('catalog.form.updated', {name: product.name});
        this.router.navigate(['/products/list']).then();
      });
      return;
    }
    this.productsStore.addProduct(data).subscribe(product => {
      this.inventory
        .registerStock({
          productId: product.id,
          lotCode: `LT-${product.id}-1`,
          quantity: Number(value.initialQuantity),
          expiresOn: value.initialExpiresOn,
          location: value.initialLocation,
          notes: 'Initial stock'
        })
        .subscribe(() => {
          this.notifier.success('catalog.form.saved', {name: product.name});
          this.router.navigate(['/products/list']).then();
        });
    });
  }
}
