import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {ProductsStore} from '../../../../products/application/products.store';
import {Notifier} from '../../../../communication/application/notifier';
import {CalendarDate} from '../../../../shared/domain/model/calendar-date';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {InventoryStore} from '../../../application/inventory.store';
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
  selector: 'app-stock-form',
  styleUrl: './stock-form.css',
  templateUrl: './stock-form.html',
})
/**
 * View to register a lot received into the inventory.
 */
export class StockForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productsStore = inject(ProductsStore);
  private readonly inventory = inject(InventoryStore);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);

  protected readonly products = this.productsStore.products;
  /** First day a received lot may expire. */
  protected readonly minExpiry = CalendarDate.today().toString();

  protected readonly form = this.fb.group({
    productId: new FormControl('', {nonNullable: true, validators: Validators.required}),
    lotCode: new FormControl('', {nonNullable: true, validators: [Validators.required, control => control.value && this.inventory.hasLot(control.value) ? {duplicate: true} : null]}),
    quantity: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(POSITIVE_INTEGER_PATTERN)]}),
    expiresOn: new FormControl('', {nonNullable: true, validators: [Validators.required, control => control.value && CalendarDate.of(control.value).isBefore(CalendarDate.today()) ? {expired: true} : null]}),
    location: new FormControl('', {nonNullable: true, validators: Validators.required}),
    notes: new FormControl('', {nonNullable: true})
  });

  ngOnInit(): void {
    this.inventory.loadInventory();
  }

  /**
   * Registers the lot and returns to the inventory.
   */
  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.inventory.registerStock({...value, quantity: Number(value.quantity)}).subscribe(lot => {
      this.notifier.success('inventory.form.saved', {lot: lot.lotCode});
      this.router.navigate(['/inventory']).then();
    });
  }
}
