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
import {ModuleBanner} from '../../../../shared/presentation/components/module-banner/module-banner';
import {StatusBadge} from '../../../../shared/presentation/components/status-badge/status-badge';
import {RequisitionStore} from '../../../application/requisition.store';
import {RequestStatus} from '../../../domain/model/supply-request.entity';
import {REQUEST_STATUS_TONE} from '../../status-tones';

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
    ModuleBanner,
    StatusBadge
  ],
  selector: 'app-request-list',
  styleUrl: './request-list.css',
  templateUrl: './request-list.html',
})
/**
 * View with the supply requests the minimarket sent to its suppliers.
 */
export class RequestList implements OnInit {
  private readonly store = inject(RequisitionStore);
  private readonly session = inject(SessionStore);

  /** Only the people of a minimarket create requests; a supplier consults them. */
  protected readonly canCreate = computed(() => this.session.canManage('/requests'));

  protected readonly columns = ['id', 'product', 'supplier', 'quantity', 'reason', 'status'];
  protected readonly requests = this.store.requestItems;
  protected readonly toneOf = (status: RequestStatus) => REQUEST_STATUS_TONE[status];

  ngOnInit(): void {
    this.store.loadRequisition();
  }
}
