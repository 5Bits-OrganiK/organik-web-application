import {Component, computed, inject, input, OnInit, signal} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatError, MatFormField} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {StatusBadge} from '../../../../shared/presentation/components/status-badge/status-badge';
import {ProcurementsStore} from '../../../application/procurements.store';
import {ORDER_STATUS_TONE} from '../../status-tones';

@Component({
  imports: [ReactiveFormsModule, RouterLink, MatButton, MatFormField, MatError, MatInput, TranslatePipe, StatusBadge],
  selector: 'app-order-detail',
  styleUrl: './order-detail.css',
  templateUrl: './order-detail.html',
})
/**
 * View with the participants, the products and the decision of one order. The administrator of the
 * destination minimarket can accept it or reject it with a reason; everybody else only consults it.
 */
export class OrderDetail implements OnInit {
  private readonly store = inject(ProcurementsStore);
  private readonly notifier = inject(Notifier);

  /** Order identifier bound from the route. */
  id = input.required<string>();

  protected readonly order = computed(() => this.store.findItem(this.id()));
  protected readonly canDecide = computed(() => this.store.canDecide(this.id()));
  protected readonly tone = computed(() => ORDER_STATUS_TONE[this.order()?.status ?? 'pending']);
  protected readonly rejecting = signal(false);
  protected readonly reason = new FormControl('', {nonNullable: true, validators: [Validators.required]});

  ngOnInit(): void {
    this.store.loadProcurements();
  }

  protected accept(): void {
    this.store.acceptOrder(this.id()).subscribe(order => this.notifier.success('shipments.detail.accepted', {id: order.id}));
  }

  protected startReject(): void {
    this.rejecting.set(true);
  }

  protected reject(): void {
    if (this.reason.invalid || !this.reason.value.trim()) {
      this.reason.markAsTouched();
      return;
    }
    this.store.rejectOrder(this.id(), this.reason.value).subscribe(order => {
      this.rejecting.set(false);
      this.notifier.success('shipments.detail.rejected', {id: order.id});
    });
  }
}
