import {Component, effect, inject, input, OnInit} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {nonNegativeIntegerValidator} from '../../../../shared/presentation/forms/validators';
import {InventoryStore} from '../../../application/inventory.store';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatError, MatInput, TranslatePipe, FormCard],
  selector: 'app-lot-form',
  styleUrl: './lot-form.css',
  templateUrl: './lot-form.html',
})
/**
 * View to update the quantity, the expiration, the location and the notes of a lot.
 */
export class LotForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly inventory = inject(InventoryStore);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);
  private filled = false;

  /** Code of the lot, bound from the route. */
  lotCode = input.required<string>();

  protected readonly form = this.fb.group({
    quantity: ['', [Validators.required, nonNegativeIntegerValidator]],
    expiresOn: ['', Validators.required],
    location: ['', Validators.required],
    notes: ['']
  });

  constructor() {
    effect(() => {
      this.inventory.items();
      const lot = this.inventory.findLot(this.lotCode());
      if (lot && !this.filled) {
        this.filled = true;
        this.form.setValue({
          quantity: String(lot.quantity.value),
          expiresOn: lot.expiresOn.toString(),
          location: lot.location,
          notes: lot.notes
        });
      }
    });
  }

  ngOnInit(): void {
    this.inventory.loadInventory();
  }

  /**
   * Saves the changes and returns to the inventory.
   */
  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.inventory.updateLot({lotCode: this.lotCode(), ...value, quantity: Number(value.quantity)}).subscribe(lot => {
      this.notifier.success('inventory.lot-form.saved', {lot: lot.lotCode});
      this.router.navigate(['/inventory']).then();
    });
  }
}
