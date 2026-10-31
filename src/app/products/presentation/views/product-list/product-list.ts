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
import {InventoryStore} from '../../../../inventory/application/inventory.store';
import {SuppliersStore} from '../../../../suppliers/application/suppliers.store';
import {ProductsStore} from '../../../application/products.store';

/** Normalizes text so searches ignore case and accents. */
const normalize = (value: string): string =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

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
  selector: 'app-product-list',
  styleUrl: './product-list.css',
  templateUrl: './product-list.html',
})
/**
 * View with every product of the catalog, its stock and the actions to edit it or see its lots.
 */
export class ProductList implements OnInit {
  private readonly productsStore = inject(ProductsStore);
  private readonly suppliers = inject(SuppliersStore);
  private readonly inventory = inject(InventoryStore);

  protected readonly search = signal('');

  protected readonly columns = ['id', 'name', 'categoryId', 'supplierName', 'unit', 'minimumStock', 'stock', 'actions'];

  protected readonly sort = viewChild(MatSort);
  protected readonly paginator = viewChild(MatPaginator);

  /** Products that match the search, with their supplier name and stock. */
  protected readonly rows = computed(() => {
    const text = normalize(this.search());
    return this.productsStore
      .products()
      .map(product => ({
        id: product.id,
        name: product.name,
        categoryId: product.categoryId,
        supplierName: this.suppliers.findById(product.supplierId)?.businessName ?? product.supplierId,
        unit: product.unit,
        minimumStock: product.minimumStock.value,
        stock: this.inventory.stockOf(product.id)
      }))
      .filter(row => !text || normalize(`${row.id} ${row.name} ${row.supplierName}`).includes(text));
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
    this.productsStore.loadProducts();
    this.suppliers.loadSuppliers();
    this.inventory.loadInventory();
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }
}
