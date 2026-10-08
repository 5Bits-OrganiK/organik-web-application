import {Component, computed, inject, OnInit, signal} from '@angular/core';
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
  MatTable
} from '@angular/material/table';
import {TranslatePipe} from '@ngx-translate/core';
import {StatusBadge} from '../../../../shared/presentation/components/status-badge/status-badge';
import {InventoryStore} from '../../../application/inventory.store';
import {ProductsStore} from '../../../../products/application/products.store';
import {STOCK_STATUSES, StockStatus} from '../../../domain/model/stock-status';
import {STOCK_STATUS_TONE} from '../../stock-status-tone';

/** Expiration windows the list can be filtered by. */
const EXPIRATION_FILTERS = ['all', 'expired', 'within-7', 'within-30'] as const;
type ExpirationFilter = (typeof EXPIRATION_FILTERS)[number];

/** Whether a lot with the given days left belongs to the expiration window. */
function matchesExpiration(daysToExpire: number, filter: ExpirationFilter): boolean {
  switch (filter) {
    case 'expired':
      return daysToExpire < 0;
    case 'within-7':
      return daysToExpire >= 0 && daysToExpire <= 7;
    case 'within-30':
      return daysToExpire >= 0 && daysToExpire <= 30;
    default:
      return true;
  }
}

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
    TranslatePipe,
    StatusBadge
  ],
  selector: 'app-inventory-list',
  styleUrl: './inventory-list.css',
  templateUrl: './inventory-list.html',
})
/**
 * View with the stock lots of the minimarket, filterable by text, category, status and expiration.
 */
export class InventoryList implements OnInit {
  private readonly store = inject(InventoryStore);
  private readonly productsStore = inject(ProductsStore);

  protected readonly columns = ['sku', 'product', 'lot', 'stock', 'expires', 'status', 'actions'];
  protected readonly categories = this.productsStore.categories;
  protected readonly expirationOptions = EXPIRATION_FILTERS;
  protected readonly statuses = STOCK_STATUSES;
  protected readonly toneOf = (status: StockStatus) => STOCK_STATUS_TONE[status];

  protected readonly search = signal('');
  protected readonly statusFilter = signal<StockStatus | 'all'>('all');
  protected readonly categoryFilter = signal('all');
  protected readonly expirationFilter = signal<ExpirationFilter>('all');

  /** Whether any filter is active. */
  protected readonly filtering = computed(
    () => !!this.search() || this.statusFilter() !== 'all' || this.categoryFilter() !== 'all' || this.expirationFilter() !== 'all'
  );

  /** Rows that match the active filters. */
  protected readonly rows = computed(() => {
    const text = normalize(this.search());
    const status = this.statusFilter();
    const category = this.categoryFilter();
    const expiration = this.expirationFilter();
    return this.store
      .items()
      .filter(item => status === 'all' || item.status === status)
      .filter(item => category === 'all' || item.categoryId === category)
      .filter(item => matchesExpiration(item.daysToExpire, expiration))
      .filter(
        item =>
          !text ||
          normalize(`${item.sku} ${item.productName} ${item.lotCode}`).includes(text)
      );
  });

  ngOnInit(): void {
    this.store.loadInventory();
  }

  protected onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  protected onCategoryChange(event: Event): void {
    this.categoryFilter.set((event.target as HTMLSelectElement).value);
  }

  protected onExpirationChange(event: Event): void {
    this.expirationFilter.set((event.target as HTMLSelectElement).value as ExpirationFilter);
  }

  /** Clears every filter so the whole inventory is shown again. */
  protected resetFilters(): void {
    this.search.set('');
    this.statusFilter.set('all');
    this.categoryFilter.set('all');
    this.expirationFilter.set('all');
  }

  protected onStatusChange(event: Event): void {
    this.statusFilter.set((event.target as HTMLSelectElement).value as StockStatus | 'all');
  }
}
