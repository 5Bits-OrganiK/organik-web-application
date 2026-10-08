import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {SessionStore} from '../../../../iam/application/session.store';
import {SuppliersStore} from '../../../application/suppliers.store';

@Component({
  imports: [RouterLink, MatAnchor, TranslatePipe],
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

  /** Offered products to show: the own ones for a supplier, every one (filterable) for a minimarket. */
  protected readonly rows = computed(() => {
    if (this.owner()) {
      return this.store.myOfferings();
    }
    const supplierId = this.supplierFilter();
    return this.store.offerings().filter(offering => !supplierId || offering.supplierId === supplierId);
  });

  ngOnInit(): void {
    this.store.loadSuppliers();
  }

  protected onSupplier(event: Event): void {
    this.supplierFilter.set((event.target as HTMLSelectElement).value);
  }
}
