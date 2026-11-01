import {Component, inject} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatButton} from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogTitle
} from '@angular/material/dialog';
import {MatError, MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  imports: [
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatFormField,
    MatLabel,
    MatError,
    MatInput,
    TranslatePipe
  ],
  selector: 'app-reject-order',
  styleUrl: './reject-order.css',
  templateUrl: './reject-order.html',
})
/**
 * Dialog that asks the administrator for the reason before an order is rejected.
 *
 * @remarks
 * It closes with the reason when the rejection is confirmed and with nothing when it is cancelled.
 */
export class RejectOrder {
  /** Identifier of the order to reject, injected by the dialog service. */
  orderId: string = inject(MAT_DIALOG_DATA);

  protected readonly reason = new FormControl('', {nonNullable: true, validators: Validators.required});
}
