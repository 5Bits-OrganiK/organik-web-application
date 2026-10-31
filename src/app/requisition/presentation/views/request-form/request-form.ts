import {Component, inject, OnInit, signal} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {ActivatedRoute, Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {ProductsStore} from '../../../../products/application/products.store';
import {Notifier} from '../../../../communication/application/notifier';
import {CalendarDate} from '../../../../shared/domain/model/calendar-date';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {SuppliersStore} from '../../../../suppliers/application/suppliers.store';
import {RequisitionStore} from '../../../application/requisition.store';
import {REQUEST_PRIORITIES, RequestPriority} from '../../../domain/model/supply-request.entity';
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
  selector: 'app-request-form',
  styleUrl: './request-form.css',
  templateUrl: './request-form.html',
})
/**
 * View to send a new supply request to a supplier.
 */
export class RequestForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly productsStore = inject(ProductsStore);
  private readonly suppliersStore = inject(SuppliersStore);
  private readonly requisition = inject(RequisitionStore);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);
  private readonly route = inject(ActivatedRoute);

  /** Supplier preselected through the `supplier` query parameter. */
  private readonly supplier = signal<string | undefined>(undefined);

  protected readonly products = this.productsStore.products;
  protected readonly suppliers = this.suppliersStore.suppliers;
  protected readonly priorities = REQUEST_PRIORITIES;
  /** First day products can be required. */
  protected readonly minDate = CalendarDate.today().toString();

  protected readonly form = this.fb.group({
    productId: new FormControl('', {nonNullable: true, validators: Validators.required}),
    supplierId: new FormControl('', {nonNullable: true, validators: Validators.required}),
    quantity: new FormControl('', {nonNullable: true, validators: [Validators.required, Validators.pattern(POSITIVE_INTEGER_PATTERN)]}),
    reason: new FormControl('', {nonNullable: true, validators: Validators.required}),
    requiredOn: new FormControl('', {nonNullable: true, validators: [Validators.required, control => control.value && CalendarDate.of(control.value).isBefore(CalendarDate.today()) ? {past: true} : null]}),
    priority: new FormControl<RequestPriority>('medium', {nonNullable: true, validators: Validators.required})
  });

  ngOnInit(): void {
    this.requisition.loadRequisition();
    this.route.queryParams.subscribe(params => {
      this.supplier.set(params['supplier']);
      if (params['supplier']) {
        this.form.controls.supplierId.setValue(params['supplier']);
      }
    });
    // Suggest the usual supplier of the product unless the user already chose one.
    this.form.controls.productId.valueChanges.subscribe(productId => {
      const usual = this.productsStore.findProduct(productId)?.supplierId;
      if (usual && !this.form.controls.supplierId.dirty && !this.supplier()) {
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
}
