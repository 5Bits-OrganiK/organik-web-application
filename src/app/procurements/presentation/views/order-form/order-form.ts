import {Component, computed, inject, OnInit} from '@angular/core';
import {AbstractControl, FormArray, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {SessionStore} from '../../../../iam/application/session.store';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {positiveIntegerValidator} from '../../../../shared/presentation/forms/validators';
import {SuppliersStore} from '../../../../suppliers/application/suppliers.store';
import {ProcurementsStore} from '../../../application/procurements.store';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatError, MatInput, TranslatePipe, FormCard],
  selector: 'app-order-form',
  styleUrl: './order-form.css',
  templateUrl: './order-form.html',
})
/**
 * View for a supplier to create an order for a linked minimarket from its own catalog.
 * The order stays pending until the administrator of the minimarket answers it.
 */
export class OrderForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(ProcurementsStore);
  private readonly suppliers = inject(SuppliersStore);
  private readonly session = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);

  /** Whether the signed-in user is a supplier, the only one that can create orders. */
  protected readonly isSupplier = computed(() => !!this.session.currentUser()?.supplierId);
  protected readonly minimarkets = this.store.linkedMinimarkets;
  protected readonly catalog = this.suppliers.myOfferings;

  protected readonly form = this.fb.group({
    minimarketId: [this.store.linkedMinimarkets[0].id, Validators.required],
    lines: this.fb.array([this.newLine()])
  });

  protected get lines(): FormArray {
    return this.form.controls.lines;
  }

  ngOnInit(): void {
    this.store.loadProcurements();
  }

  /** Units the supplier has available for the entry chosen in a line. */
  protected availableFor(line: AbstractControl): number | null {
    const offering = this.catalog().find(item => item.id === line.get('offeringId')?.value);
    return offering ? offering.availableQuantity : null;
  }

  protected addLine(): void {
    this.lines.push(this.newLine());
  }

  protected removeLine(index: number): void {
    if (this.lines.length > 1) {
      this.lines.removeAt(index);
    }
  }

  /**
   * Creates the pending order and returns to the list.
   */
  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.store
      .createOrder({
        minimarketId: value.minimarketId,
        lines: value.lines.map((line: {offeringId: string; quantity: string}) => ({
          offeringId: line.offeringId,
          quantity: Number(line.quantity)
        }))
      })
      .subscribe(order => {
        this.notifier.success('shipments.form.saved', {id: order.id});
        this.router.navigate(['/shipments']).then();
      });
  }

  private newLine() {
    const line = this.fb.group({
      offeringId: ['', Validators.required],
      quantity: ['', [Validators.required, positiveIntegerValidator]]
    });
    line.controls.quantity.addValidators((control: AbstractControl<string>) => this.withinAvailability(line, control));
    line.controls.offeringId.valueChanges.subscribe(() => line.controls.quantity.updateValueAndValidity());
    return line;
  }

  private withinAvailability(line: AbstractControl, control: AbstractControl<string>): ValidationErrors | null {
    const available = this.availableFor(line);
    return available !== null && Number(control.value) > available ? {exceeds: true} : null;
  }
}
