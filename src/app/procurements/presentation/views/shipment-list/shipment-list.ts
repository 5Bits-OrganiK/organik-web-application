import {Component, computed, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {SessionStore} from '../../../../iam/application/session.store';
import {StatusBadge} from '../../../../shared/presentation/components/status-badge/status-badge';
import {ProcurementsStore} from '../../../application/procurements.store';
import {OrderStatus} from '../../../domain/model/shipment-order.entity';
import {ORDER_STATUS_TONE} from '../../status-tones';

@Component({
  imports: [
    RouterLink,
    MatAnchor,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    TranslatePipe,
    StatusBadge
  ],
  selector: 'app-shipment-list',
  styleUrl: './shipment-list.css',
  templateUrl: './shipment-list.html',
})
/**
 * View with the orders of the signed-in user: the ones a supplier sent, or the ones addressed to a minimarket.
 */
export class ShipmentList implements OnInit {
  private readonly store = inject(ProcurementsStore);
  private readonly session = inject(SessionStore);

  protected readonly columns = ['order', 'party', 'products', 'date', 'status', 'actions'];
  protected readonly shipments = this.store.shipmentItems;
  protected readonly isSupplier = computed(() => !!this.session.currentUser()?.supplierId);
  protected readonly toneOf = (status: OrderStatus) => ORDER_STATUS_TONE[status];

  ngOnInit(): void {
    this.store.loadProcurements();
  }
}
