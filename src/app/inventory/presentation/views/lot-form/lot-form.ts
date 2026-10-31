import {Component, inject, signal} from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators, FormControl} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {InventoryStore} from '../../../application/inventory.store';
import {NON_NEGATIVE_INTEGER_PATTERN} from '../../../../shared/presentation/forms/form-patterns';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatError, MatInput, TranslatePipe, FormCard],
  selector: 'app-lot-form',
  styleUrl: './lot-form.css',
  templateUrl: './lot-form.html',
})
/**
 * View to update the quantity, the expiration, the location and the notes of a lot.
 */
export class LotForm {
  private readonly fb = inject(FormBuilder);
  private readonly inventory = inject(InventoryStore);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);
  private readonly route = inject(ActivatedRoute);

  /** Code of the lot, read from the route. */
  protected readonly lotCode = signal('');

  protected readonly form = this.fb.group({
    quantity: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(NON_NEGATIVE_INTEGER_PATTERN)]}),
    expiresOn: new FormControl('', {nonNullable: true, validators: Validators.required}),
    location: new FormControl('', {nonNullable: true, validators: Validators.required}),
    notes: new FormControl('', {nonNullable: true})
  });

  constructor() {
    this.route.params.subscribe(params => {
      this.lotCode.set(params['lotCode']);
      // Fill the form once the lot to edit is available.
      this.inventory.loadInventory().subscribe(() => this.fill());
    });
  }

  private fill(): void {
    const lot = this.inventory.findLot(this.lotCode());
    if (lot) {
      this.form.setValue({
        quantity: String(lot.quantity.value),
        expiresOn: lot.expiresOn.toString(),
        location: lot.location,
        notes: lot.notes
      });
    }
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
