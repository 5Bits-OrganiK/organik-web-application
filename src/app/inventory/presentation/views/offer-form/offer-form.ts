import {Component, computed, inject, OnInit} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField, MatHint} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {ProductsStore} from '../../../../products/application/products.store';
import {CalendarDate} from '../../../../shared/domain/model/calendar-date';
import {Clock} from '../../../../shared/domain/services/clock';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {positiveIntegerValidator} from '../../../../shared/presentation/forms/validators';
import {InventoryStore} from '../../../application/inventory.store';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatError, MatHint, MatInput, TranslatePipe, FormCard],
  selector: 'app-offer-form',
  styleUrl: './offer-form.css',
  templateUrl: './offer-form.html',
})
/**
 * View to put units of a product on offer.
 */
export class OfferForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly inventory = inject(InventoryStore);
  private readonly productsStore = inject(ProductsStore);
  private readonly clock = inject(Clock);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);

  /** First day an offer may end. */
  protected readonly minDate = this.clock.today().toString();
  /** Products that have stock to offer. */
  protected readonly products = computed(() =>
    this.productsStore.products().filter(product => this.inventory.stockOf(product.id) > 0)
  );

  protected readonly form = this.fb.group({
    productId: ['', Validators.required],
    quantity: ['', [Validators.required, positiveIntegerValidator, (control: AbstractControl<string>) => this.exceedsStock(control)]],
    validUntil: ['', [Validators.required, (control: AbstractControl<string>) => this.inThePast(control)]]
  });

  private readonly selected = toSignal(this.form.controls.productId.valueChanges, {initialValue: ''});
  /** Units available of the selected product, shown as a hint. */
  protected readonly availableUnits = computed(() => (this.selected() ? this.inventory.stockOf(this.selected()) : null));

  constructor() {
    this.form.controls.productId.valueChanges.subscribe(() => this.form.controls.quantity.updateValueAndValidity());
  }

  ngOnInit(): void {
    this.inventory.loadInventory();
  }

  /**
   * Registers the offer and returns to the inventory.
   */
  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.inventory.registerOffer({...value, quantity: Number(value.quantity)}).subscribe(() => {
      this.notifier.success('inventory.offer-form.saved');
      this.router.navigate(['/inventory/history']).then();
    });
  }

  private exceedsStock(control: AbstractControl<string>): ValidationErrors | null {
    const productId = this.form?.controls.productId.value;
    return productId && control.value && Number(control.value) > this.inventory.stockOf(productId) ? {exceeds: true} : null;
  }

  private inThePast(control: AbstractControl<string>): ValidationErrors | null {
    return control.value && CalendarDate.of(control.value).isBefore(this.clock.today()) ? {past: true} : null;
  }
}
