import {Component, inject, OnInit} from '@angular/core';
import {AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {ProductsStore} from '../../../../products/application/products.store';
import {Notifier} from '../../../../communication/application/notifier';
import {CalendarDate} from '../../../../shared/domain/model/calendar-date';
import {Clock} from '../../../../shared/domain/services/clock';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {positiveIntegerValidator} from '../../../../shared/presentation/forms/validators';
import {InventoryStore} from '../../../application/inventory.store';

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
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productsStore = inject(ProductsStore);
  private readonly inventory = inject(InventoryStore);
  private readonly clock = inject(Clock);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);

  protected readonly products = this.productsStore.products;
  /** First day a received lot may expire. */
  protected readonly minExpiry = this.clock.today().toString();

  protected readonly form = this.fb.group({
    productId: ['', Validators.required],
    lotCode: ['', [Validators.required, (control: AbstractControl<string>) => this.lotCodeTaken(control)]],
    quantity: ['', [Validators.required, positiveIntegerValidator]],
    expiresOn: ['', [Validators.required, (control: AbstractControl<string>) => this.notExpired(control)]],
    location: ['', Validators.required],
    notes: ['']
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

  private lotCodeTaken(control: AbstractControl<string>): ValidationErrors | null {
    return control.value && this.inventory.hasLot(control.value) ? {duplicate: true} : null;
  }

  private notExpired(control: AbstractControl<string>): ValidationErrors | null {
    return control.value && CalendarDate.of(control.value).isBefore(this.clock.today())
      ? {expired: true}
      : null;
  }
}
