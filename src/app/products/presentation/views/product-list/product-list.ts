import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {InventoryStore} from '../../../../inventory/application/inventory.store';
import {SuppliersStore} from '../../../../suppliers/application/suppliers.store';
import {ProductsStore} from '../../../application/products.store';

/** Normalizes text so searches ignore case and accents. */
const normalize = (value: string): string =>
  value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

@Component({
  imports: [RouterLink, MatAnchor, TranslatePipe],
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

  /** Products that match the search, with their supplier name and stock. */
  protected readonly rows = computed(() => {
    const text = normalize(this.search());
    return this.productsStore
      .products()
      .map(product => ({
        product,
        supplierName: this.suppliers.findById(product.supplierId)?.businessName ?? product.supplierId,
        stock: this.inventory.stockOf(product.id)
      }))
      .filter(row => !text || normalize(`${row.product.id} ${row.product.name} ${row.supplierName}`).includes(text));
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
