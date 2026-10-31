import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {SessionStore} from '../../../../iam/application/session.store';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {POSITIVE_INTEGER_PATTERN} from '../../../../shared/presentation/forms/form-patterns';
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
  private readonly fb = inject(FormBuilder);
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
    minimarketId: new FormControl(this.store.linkedMinimarkets[0].id, {nonNullable: true, validators: Validators.required})
  });

  /** One form group per product line of the order. */
  protected readonly lines = signal([this.newLine()]);

  ngOnInit(): void {
    this.store.loadProcurements();
  }

  /** Units the supplier has available for the entry chosen in a line. */
  protected availableFor(line: ReturnType<OrderForm['newLine']>): number | null {
    const offering = this.catalog().find(item => item.id === line.controls.offeringId.value);
    return offering ? offering.availableQuantity : null;
  }

  protected addLine(): void {
    this.lines.update(lines => [...lines, this.newLine()]);
  }

  protected removeLine(index: number): void {
    if (this.lines().length > 1) {
      this.lines.update(lines => lines.filter((_, position) => position !== index));
    }
  }

  /**
   * Creates the pending order and returns to the list.
   */
  protected save(): void {
    if (this.form.invalid || this.lines().some(line => line.invalid)) {
      this.form.markAllAsTouched();
      this.lines().forEach(line => line.markAllAsTouched());
      return;
    }
    this.store
      .createOrder({
        minimarketId: this.form.getRawValue().minimarketId,
        lines: this.lines().map(line => ({
          offeringId: line.getRawValue().offeringId,
          quantity: Number(line.getRawValue().quantity)
        }))
      })
      .subscribe(order => {
        this.notifier.success('shipments.form.saved', {id: order.id});
        this.router.navigate(['/shipments']).then();
      });
  }

  private newLine() {
    const line = this.fb.group({
      offeringId: new FormControl('', {nonNullable: true, validators: Validators.required}),
      quantity: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(POSITIVE_INTEGER_PATTERN)]})
    });
    // The units ordered cannot exceed the units the supplier has available for the chosen entry.
    line.controls.offeringId.valueChanges.subscribe(offeringId => {
      const offering = this.catalog().find(item => item.id === offeringId);
      line.controls.quantity.setValidators([
        Validators.required,
        Validators.pattern(POSITIVE_INTEGER_PATTERN),
        ...(offering ? [Validators.max(offering.availableQuantity)] : [])
      ]);
      line.controls.quantity.updateValueAndValidity();
    });
    return line;
  }
}
