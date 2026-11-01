import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField, MatHint} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {InventoryStore} from '../../../application/inventory.store';
import {WASTE_CAUSES, WasteCause} from '../../../domain/model/inventory-event';
import {POSITIVE_INTEGER_PATTERN} from '../../../../shared/presentation/forms/form-patterns';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatError, MatHint, MatInput, MatSelectModule, TranslatePipe, FormCard],
  selector: 'app-waste-form',
  styleUrl: './waste-form.css',
  templateUrl: './waste-form.html',
})
/**
 * View to register units lost from a lot (waste).
 */
export class WasteForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventory = inject(InventoryStore);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);

  protected readonly causes = WASTE_CAUSES;
  /** Lots that still have units to lose. */
  protected readonly lots = computed(() => this.inventory.items().filter(item => item.quantity > 0));

  protected readonly form = this.fb.group({
    lotCode: new FormControl('', {nonNullable: true, validators: Validators.required}),
    quantity: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(POSITIVE_INTEGER_PATTERN)]}),
    cause: new FormControl('expired' as WasteCause, {nonNullable: true, validators: Validators.required})
  });

  /** Units the selected lot holds, shown as a hint. */
  protected readonly available = signal('');
  protected readonly availableUnits = computed(() => this.inventory.findLot(this.available())?.quantity.value ?? null);

  constructor() {
    // The units lost cannot exceed the units the chosen lot holds.
    this.form.controls.lotCode.valueChanges.subscribe(lotCode => {
      this.available.set(lotCode);
      const lot = this.inventory.findLot(lotCode);
      this.form.controls.quantity.setValidators([
        Validators.required,
        Validators.pattern(POSITIVE_INTEGER_PATTERN),
        ...(lot ? [Validators.max(lot.quantity.value)] : [])
      ]);
      this.form.controls.quantity.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.inventory.loadInventory();
  }

  /**
   * Registers the waste and returns to the inventory.
   */
  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.inventory.registerWaste({...value, quantity: Number(value.quantity)}).subscribe(() => {
      this.notifier.success('inventory.waste-form.saved', {quantity: value.quantity});
      this.router.navigate(['/inventory']).then();
    });
  }
}
