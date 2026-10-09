import {Component, computed, inject, OnInit} from '@angular/core';
import {toSignal} from '@angular/core/rxjs-interop';
import {AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField, MatHint} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {positiveIntegerValidator} from '../../../../shared/presentation/forms/validators';
import {InventoryStore} from '../../../application/inventory.store';
import {WASTE_CAUSES, WasteCause} from '../../../domain/model/inventory-event';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatError, MatHint, MatInput, TranslatePipe, FormCard],
  selector: 'app-waste-form',
  styleUrl: './waste-form.css',
  templateUrl: './waste-form.html',
})
/**
 * View to register units lost from a lot (waste).
 */
export class WasteForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly inventory = inject(InventoryStore);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);

  protected readonly causes = WASTE_CAUSES;
  /** Lots that still have units to lose. */
  protected readonly lots = computed(() => this.inventory.items().filter(item => item.quantity > 0));

  protected readonly form = this.fb.group({
    lotCode: ['', Validators.required],
    quantity: ['', [Validators.required, positiveIntegerValidator, (control: AbstractControl<string>) => this.exceedsLot(control)]],
    cause: ['expired' as WasteCause, Validators.required]
  });

  /** Units the selected lot holds, shown as a hint. */
  protected readonly available = toSignal(this.form.controls.lotCode.valueChanges, {initialValue: ''});
  protected readonly availableUnits = computed(() => this.inventory.findLot(this.available())?.quantity.value ?? null);

  constructor() {
    this.form.controls.lotCode.valueChanges.subscribe(() => this.form.controls.quantity.updateValueAndValidity());
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

  private exceedsLot(control: AbstractControl<string>): ValidationErrors | null {
    const lot = this.inventory.findLot(this.form?.controls.lotCode.value ?? '');
    return lot && control.value && Number(control.value) > lot.quantity.value ? {exceeds: true} : null;
  }
}
