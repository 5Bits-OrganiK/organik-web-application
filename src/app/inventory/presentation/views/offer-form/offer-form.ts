import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField, MatHint} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {ProductsStore} from '../../../../products/application/products.store';
import {CalendarDate} from '../../../../shared/domain/model/calendar-date';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {InventoryStore} from '../../../application/inventory.store';
import {POSITIVE_INTEGER_PATTERN} from '../../../../shared/presentation/forms/form-patterns';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatError, MatHint, MatInput, MatSelectModule, TranslatePipe, FormCard],
  selector: 'app-offer-form',
  styleUrl: './offer-form.css',
  templateUrl: './offer-form.html',
})
/**
 * View to put units of a product on offer.
 */
export class OfferForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventory = inject(InventoryStore);
  private readonly productsStore = inject(ProductsStore);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);

  /** First day an offer may end. */
  protected readonly minDate = CalendarDate.today().toString();
  /** Products that have stock to offer. */
  protected readonly products = computed(() =>
    this.productsStore.products().filter(product => this.inventory.stockOf(product.id) > 0)
  );

  protected readonly form = this.fb.group({
    productId: new FormControl('', {nonNullable: true, validators: Validators.required}),
    quantity: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(POSITIVE_INTEGER_PATTERN)]}),
    validUntil: new FormControl('', {nonNullable: true, validators: [Validators.required, control => control.value && CalendarDate.of(control.value).isBefore(CalendarDate.today()) ? {past: true} : null]})
  });

  private readonly selected = signal('');
  /** Units available of the selected product, shown as a hint. */
  protected readonly availableUnits = computed(() => (this.selected() ? this.inventory.stockOf(this.selected()) : null));

  constructor() {
    // The units offered cannot exceed the stock of the chosen product.
    this.form.controls.productId.valueChanges.subscribe(productId => {
      this.selected.set(productId);
      this.form.controls.quantity.setValidators([
        Validators.required,
        Validators.pattern(POSITIVE_INTEGER_PATTERN),
        Validators.max(this.inventory.stockOf(productId))
      ]);
      this.form.controls.quantity.updateValueAndValidity();
    });
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
}
