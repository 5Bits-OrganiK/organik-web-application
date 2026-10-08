import {Component, computed, effect, inject, input, OnInit} from '@angular/core';
import {AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {ProductsStore} from '../../../../products/application/products.store';
import {CalendarDate} from '../../../../shared/domain/model/calendar-date';
import {Clock} from '../../../../shared/domain/services/clock';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {nonNegativeIntegerValidator} from '../../../../shared/presentation/forms/validators';
import {SuppliersStore} from '../../../application/suppliers.store';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatError, MatInput, TranslatePipe, FormCard],
  selector: 'app-offering-form',
  styleUrl: './offering-form.css',
  templateUrl: './offering-form.html',
})
/**
 * View for a supplier to publish a product in its catalog, or to update the lot and the availability of one.
 */
export class OfferingForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(SuppliersStore);
  private readonly productsStore = inject(ProductsStore);
  private readonly clock = inject(Clock);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);
  private filled = false;

  /** Identifier of the entry to edit, bound from the route; empty when a product is published. */
  id = input<string>();

  protected readonly editing = computed(() => !!this.id());
  protected readonly products = this.productsStore.products;
  /** First day the lot may expire. */
  protected readonly minExpiry = this.clock.today().toString();

  protected readonly form = this.fb.group({
    productId: ['', Validators.required],
    lotCode: ['', Validators.required],
    availableQuantity: ['', [Validators.required, nonNegativeIntegerValidator]],
    expiresOn: ['', [Validators.required, (control: AbstractControl<string>) => this.notExpired(control)]]
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) {
        return;
      }
      this.form.controls.productId.disable({emitEvent: false});
      const offered = this.store.findOffering(id);
      if (offered && !this.filled) {
        this.filled = true;
        this.form.patchValue({
          productId: offered.productId,
          lotCode: offered.lotCode,
          availableQuantity: String(offered.availableQuantity.value),
          expiresOn: offered.expiresOn.toString()
        });
      }
    });
  }

  ngOnInit(): void {
    this.store.loadSuppliers();
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

  private notExpired(control: AbstractControl<string>): ValidationErrors | null {
    return control.value && CalendarDate.of(control.value).isBefore(this.clock.today()) ? {expired: true} : null;
  }
}
