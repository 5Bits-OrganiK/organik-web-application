import {Component, computed, inject, signal} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {ProductsStore} from '../../../../products/application/products.store';
import {CalendarDate} from '../../../../shared/domain/model/calendar-date';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {SuppliersStore} from '../../../application/suppliers.store';
import {NON_NEGATIVE_INTEGER_PATTERN} from '../../../../shared/presentation/forms/form-patterns';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatError, MatInput, MatSelectModule, TranslatePipe, FormCard],
  selector: 'app-offering-form',
  styleUrl: './offering-form.css',
  templateUrl: './offering-form.html',
})
/**
 * View for a supplier to publish a product in its catalog, or to update the lot and the availability of one.
 */
export class OfferingForm {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(SuppliersStore);
  private readonly productsStore = inject(ProductsStore);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);
  private readonly route = inject(ActivatedRoute);

  /** Identifier of the entry to edit, read from the route; empty when a product is published. */
  protected readonly id = signal<string | undefined>(undefined);

  protected readonly editing = computed(() => !!this.id());
  protected readonly products = this.productsStore.products;
  /** First day the lot may expire. */
  protected readonly minExpiry = CalendarDate.today().toString();

  protected readonly form = this.fb.group({
    productId: new FormControl('', {nonNullable: true, validators: Validators.required}),
    lotCode: new FormControl('', {nonNullable: true, validators: Validators.required}),
    availableQuantity: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(NON_NEGATIVE_INTEGER_PATTERN)]}),
    expiresOn: new FormControl('', {nonNullable: true, validators: [Validators.required, control => control.value && CalendarDate.of(control.value).isBefore(CalendarDate.today()) ? {expired: true} : null]})
  });

  constructor() {
    this.route.params.subscribe(params => {
      this.id.set(params['id']);
      if (params['id']) {
        this.form.controls.productId.disable({emitEvent: false});
      }
      // Fill the form once the entry to edit is available.
      this.store.loadSuppliers().subscribe(() => this.fill());
    });
  }

  private fill(): void {
    const id = this.id();
    const offered = id ? this.store.findOffering(id) : undefined;
    if (offered) {
      this.form.patchValue({
        productId: offered.productId,
        lotCode: offered.lotCode,
        availableQuantity: String(offered.availableQuantity.value),
        expiresOn: offered.expiresOn.toString()
      });
    }
  }

  /**
   * Saves the entry and returns to the catalog.
   */
  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const command = {...value, availableQuantity: Number(value.availableQuantity)};
    const id = this.id();
    const saved = id ? this.store.updateOffering(id, command) : this.store.registerOffering(command);
    saved.subscribe(() => {
      this.notifier.success(id ? 'catalog-page.form.updated' : 'catalog-page.form.saved');
      this.router.navigate(['/catalog']).then();
    });
  }
}
