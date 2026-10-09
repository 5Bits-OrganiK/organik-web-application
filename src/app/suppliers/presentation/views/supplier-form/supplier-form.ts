import {Component, inject} from '@angular/core';
import {NonNullableFormBuilder, ReactiveFormsModule, Validators} from '@angular/forms';
import {Router, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {emailValidator} from '../../../../shared/presentation/forms/validators';
import {FormCard} from '../../../../shared/presentation/components/form-card/form-card';
import {SuppliersStore} from '../../../application/suppliers.store';

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
  selector: 'app-supplier-form',
  styleUrl: './supplier-form.css',
  templateUrl: './supplier-form.html',
})
/**
 * View to register a new supplier.
 */
export class SupplierForm {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(SuppliersStore);
  private readonly router = inject(Router);
  private readonly notifier = inject(Notifier);

  protected readonly form = this.fb.group({
    businessName: ['', Validators.required],
    contactName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^[0-9+()\s-]{6,}$/)]],
    email: ['', [Validators.required, emailValidator]],
    categories: ['', Validators.required],
    organicCertification: ['', Validators.required]
  });

  /**
   * Registers the supplier and returns to the directory.
   */
  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.registerSupplier(this.form.getRawValue()).subscribe(supplier => {
      this.notifier.success('suppliers.form.saved', {name: supplier.businessName});
      this.router.navigate(['/suppliers']).then();
    });
  }
}
