import {Component, computed, inject, OnInit, signal, viewChild} from '@angular/core';
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
  MatNoDataRow,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource
} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort, MatSortHeader} from '@angular/material/sort';
import {TranslatePipe} from '@ngx-translate/core';
import {SessionStore} from '../../../../iam/application/session.store';
import {SuppliersStore} from '../../../application/suppliers.store';

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
    MatNoDataRow,
    MatSort,
    MatSortHeader,
    MatPaginator,
    TranslatePipe
  ],
  selector: 'app-catalog-list',
  styleUrl: './catalog-list.css',
  templateUrl: './catalog-list.html',
})
/**
 * View with the products the suppliers offer: a supplier sees and edits its own catalog, the
 * minimarkets only consult the catalogs of their suppliers.
 */
export class CatalogList implements OnInit {
  private readonly store = inject(SuppliersStore);
  private readonly session = inject(SessionStore);

  /** Whether the user is the supplier that owns the catalog and can change it. */
  protected readonly owner = computed(() => this.session.canManage('/catalog'));
  protected readonly suppliers = this.store.suppliers;
  protected readonly supplierFilter = signal('');

  /** Columns to display: the owner edits its catalog, a minimarket also sees the supplier. */
  protected readonly columns = computed(() =>
    this.owner()
      ? ['productName', 'lotCode', 'availableQuantity', 'expiresOn', 'updatedOn', 'actions']
      : ['supplierName', 'productName', 'lotCode', 'availableQuantity', 'expiresOn', 'updatedOn']
  );

  protected readonly sort = viewChild(MatSort);
  protected readonly paginator = viewChild(MatPaginator);

  /** Offered products to show: the own ones for a supplier, every one (filterable) for a minimarket. */
  protected readonly rows = computed(() => {
    if (this.owner()) {
      return this.store.myOfferings();
    }
    const supplierId = this.supplierFilter();
    return this.store.offerings().filter(offering => !supplierId || offering.supplierId === supplierId);
  });

  /** Data source of the table, sorted and paged by the table controls. */
  protected readonly dataSource = computed(() => {
    const source = new MatTableDataSource(this.rows());
    const sort = this.sort();
    if (sort) {
      source.sort = sort;
    }
    const paginator = this.paginator();
    if (paginator) {
      source.paginator = paginator;
    }
    return source;
  });

  ngOnInit(): void {
    this.store.loadSuppliers();
  }

  protected onSupplier(event: Event): void {
    this.supplierFilter.set((event.target as HTMLSelectElement).value);
  }
}
