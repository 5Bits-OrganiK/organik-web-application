import {Component, DestroyRef, inject, input, OnInit} from '@angular/core';
import {takeUntilDestroyed} from '@angular/core/rxjs-interop';
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
import {SuppliersStore} from '../../../../suppliers/application/suppliers.store';
import {RequisitionStore} from '../../../application/requisition.store';
import {REQUEST_PRIORITIES, RequestPriority} from '../../../domain/model/supply-request.entity';

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
  selector: 'app-request-form',
  styleUrl: './request-form.css',
  templateUrl: './request-form.html',
})
/**
 * View to send a new supply request to a supplier.
 */
export class RequestForm implements OnInit {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly productsStore = inject(ProductsStore);
  private readonly suppliersStore = inject(SuppliersStore);
  private readonly requisition = inject(RequisitionStore);
  private readonly clock = inject(Clock);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);
  private readonly destroyRef = inject(DestroyRef);

  /** Supplier preselected through the `supplier` query parameter. */
  supplier = input<string>();

  protected readonly products = this.productsStore.products;
  protected readonly suppliers = this.suppliersStore.suppliers;
  protected readonly priorities = REQUEST_PRIORITIES;
  /** First day products can be required. */
  protected readonly minDate = this.clock.today().toString();

  protected readonly form = this.fb.group({
    productId: ['', Validators.required],
    supplierId: ['', Validators.required],
    quantity: ['', [Validators.required, positiveIntegerValidator]],
    reason: ['', Validators.required],
    requiredOn: ['', [Validators.required, (control: AbstractControl<string>) => this.notPast(control)]],
    priority: this.fb.control<RequestPriority>('medium', Validators.required)
  });

  ngOnInit(): void {
    this.requisition.loadRequisition();
    const preselected = this.supplier();
    if (preselected) {
      this.form.controls.supplierId.setValue(preselected);
    }
    // Suggest the usual supplier of the product unless the user already chose one.
    this.form.controls.productId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(productId => {
        const usual = this.productsStore.findProduct(productId)?.supplierId;
        if (usual && !this.form.controls.supplierId.dirty && !preselected) {
          this.form.controls.supplierId.setValue(usual);
        }
      });
  }

  /**
   * Sends the request and returns to the requests list.
   */
  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    this.requisition
      .createSupplyRequest({...value, quantity: Number(value.quantity)})
      .subscribe(request => {
        this.notifier.success('requests.form.saved', {id: request.id});
        this.router.navigate(['/requests']).then();
      });
  }

  private notPast(control: AbstractControl<string>): ValidationErrors | null {
    return control.value && CalendarDate.of(control.value).isBefore(this.clock.today())
      ? {past: true}
      : null;
  }
}
