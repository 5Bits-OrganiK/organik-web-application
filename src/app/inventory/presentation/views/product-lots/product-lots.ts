import {Component, computed, inject, input, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {ProductsStore} from '../../../../products/application/products.store';
import {StatusBadge} from '../../../../shared/presentation/components/status-badge/status-badge';
import {SuppliersStore} from '../../../../suppliers/application/suppliers.store';
import {InventoryStore} from '../../../application/inventory.store';
import {StockStatus} from '../../../domain/model/stock-status';
import {STOCK_STATUS_TONE} from '../../stock-status-tone';

@Component({
  imports: [RouterLink, MatAnchor, TranslatePipe, StatusBadge],
  selector: 'app-product-lots',
  styleUrl: './product-lots.css',
  templateUrl: './product-lots.html',
})
/**
 * View with the lots of one product, their origin and their expiration status.
 */
export class ProductLots implements OnInit {
  private readonly inventory = inject(InventoryStore);
  private readonly productsStore = inject(ProductsStore);
  private readonly suppliers = inject(SuppliersStore);

  /** SKU of the product, bound from the route. */
  productId = input.required<string>();

  protected readonly product = computed(() => this.productsStore.findProduct(this.productId()));
  protected readonly supplierName = computed(() => {
    const supplierId = this.product()?.supplierId;
    return supplierId ? (this.suppliers.findById(supplierId)?.businessName ?? supplierId) : '';
  });
  protected readonly lots = computed(() => this.inventory.lotsOf(this.productId()));
  protected readonly stock = computed(() => this.inventory.stockOf(this.productId()));
  protected readonly toneOf = (status: StockStatus) => STOCK_STATUS_TONE[status];

  ngOnInit(): void {
    this.inventory.loadInventory();
    this.suppliers.loadSuppliers();
  }
}
