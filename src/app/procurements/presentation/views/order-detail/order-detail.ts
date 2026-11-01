import {DatePipe} from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatButton} from '@angular/material/button';
import {MatDialog} from '@angular/material/dialog';
import {TranslatePipe} from '@ngx-translate/core';
import {Notifier} from '../../../../communication/application/notifier';
import {StatusBadge} from '../../../../shared/presentation/components/status-badge/status-badge';
import {ProcurementsStore} from '../../../application/procurements.store';
import {RejectOrder} from '../../components/reject-order/reject-order';
import {ORDER_STATUS_TONE} from '../../status-tones';

@Component({
  imports: [RouterLink, MatButton, DatePipe, TranslatePipe, StatusBadge],
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
  private readonly dialog = inject(MatDialog);
  private readonly route = inject(ActivatedRoute);

  /** Order identifier, read from the route. */
  protected readonly id = signal('');

  protected readonly order = computed(() => this.store.findItem(this.id()));
  protected readonly canDecide = computed(() => this.store.canDecide(this.id()));
  protected readonly tone = computed(() => ORDER_STATUS_TONE[this.order()?.status ?? 'pending']);

  constructor() {
    this.route.params.subscribe(params => this.id.set(params['id']));
  }

  ngOnInit(): void {
    this.store.loadProcurements();
  }

  protected accept(): void {
    this.store.acceptOrder(this.id()).subscribe(order => this.notifier.success('shipments.detail.accepted', {id: order.id}));
  }

  /**
   * Asks for the reason in a dialog and rejects the order when it is confirmed.
   */
  protected reject(): void {
    this.dialog
      .open(RejectOrder, {data: this.id()})
      .afterClosed()
      .subscribe((reason?: string) => {
        if (reason) {
          this.store.rejectOrder(this.id(), reason).subscribe(order => {
            this.notifier.success('shipments.detail.rejected', {id: order.id});
          });
        }
      });
  }
}
