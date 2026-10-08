import {Component, inject, OnInit} from '@angular/core';
import {DecimalPipe} from '@angular/common';
import {RouterLink} from '@angular/router';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {KpiCard} from '../../../../shared/presentation/components/kpi-card/kpi-card';
import {DashboardStore} from '../../../application/dashboard.store';

/** A module summarized in the operational overview. */
interface OverviewLink {
  link: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  imports: [
    DecimalPipe,
    RouterLink,
    MatIcon,
    TranslatePipe,
    KpiCard
  ],
  selector: 'app-dashboard',
  styleUrl: './dashboard.css',
  templateUrl: './dashboard.html',
})
/**
 * Landing view of the administrative frontend: health, key figures, recent activity and shortcuts.
 */
export class Dashboard implements OnInit {
  private readonly store = inject(DashboardStore);

  protected readonly summary = this.store.summary;
  protected readonly activity = this.store.activity;
  protected readonly isSupplier = this.store.isSupplier;
  protected readonly supplierSummary = this.store.supplierSummary;
  protected readonly attention = this.store.attention;

  /** Modules summarized in the "operational overview" panel. */
  protected readonly overview: readonly OverviewLink[] = [
    {link: '/inventory', icon: 'inventory_2', title: 'dashboard.overview.inventory', description: 'dashboard.overview.inventory-text'},
    {link: '/requests', icon: 'receipt_long', title: 'dashboard.overview.requests', description: 'dashboard.overview.requests-text'},
    {link: '/shipments', icon: 'local_shipping', title: 'dashboard.overview.shipments', description: 'dashboard.overview.shipments-text'}
  ];

  /** Modules a supplier works with, shown in place of the operational overview. */
  protected readonly supplierOverview: readonly OverviewLink[] = [
    {link: '/requests', icon: 'receipt_long', title: 'dashboard.overview.requests', description: 'dashboard.supplier.requests-text'},
    {link: '/catalog', icon: 'storefront', title: 'dashboard.supplier.catalog', description: 'dashboard.supplier.catalog-text'},
    {link: '/shipments', icon: 'local_shipping', title: 'dashboard.supplier.orders', description: 'dashboard.supplier.orders-text'}
  ];

  ngOnInit(): void {
    this.store.loadDashboard();
  }
}
