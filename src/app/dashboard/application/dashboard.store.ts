import {computed, inject, Injectable} from '@angular/core';
import {AnalyticsStore} from '../../analytics/application/analytics.store';
import {ConservationStore} from '../../conservation/application/conservation.store';
import {SessionStore} from '../../iam/application/session.store';
import {InventoryStore} from '../../inventory/application/inventory.store';
import {ProcurementsStore} from '../../procurements/application/procurements.store';
import {RequisitionStore} from '../../requisition/application/requisition.store';
import {SuppliersStore} from '../../suppliers/application/suppliers.store';

/** How much attention a recent activity needs. */
export type ActivityTone = 'urgent' | 'info';

/**
 * One entry of the recent activity feed.
 *
 * @remarks
 * `kind` selects the translation of the entry; `params` fill its placeholders.
 */
export interface ActivityEntry {
  kind: 'expiration' | 'request' | 'sensor' | 'order-accepted' | 'order-rejected';
  tone: ActivityTone;
  params: Record<string, string | number>;
}

/** Figures of the dashboard of a supplier. */
export interface SupplierSummary {
  /** Needs the minimarkets shared with the supplier. */
  needs: number;
  /** Products the supplier offers. */
  offered: number;
  pending: number;
  accepted: number;
  rejected: number;
}

/** What needs the attention of the administrator of a minimarket. */
export interface AttentionSummary {
  /** Lots close to expire or already expired. */
  expiring: number;
  /** Products below their minimum stock. */
  shortages: number;
  /** Orders waiting for an answer. */
  pendingOrders: number;
}

/** Figures shown in the cards at the top of the dashboard. */
export interface DashboardSummary {
  /** Overall operational health, 0–100, or `null` while it loads. */
  health: number | null;
  units: number;
  requests: number;
  pendingShipments: number;
}

@Injectable({providedIn: 'root'})
/**
 * Application service that gathers the figures of the other bounded contexts for the dashboard.
 *
 * @remarks
 * It owns no data: it only composes read models exposed by the inventory, requisition,
 * procurements, conservation and analytics stores.
 */
export class DashboardStore {
  private readonly analytics = inject(AnalyticsStore);
  private readonly inventory = inject(InventoryStore);
  private readonly requisition = inject(RequisitionStore);
  private readonly procurements = inject(ProcurementsStore);
  private readonly conservation = inject(ConservationStore);
  private readonly suppliers = inject(SuppliersStore);
  private readonly session = inject(SessionStore);

  /** Whether the signed-in user works for a supplier, who gets its own dashboard. */
  readonly isSupplier = computed(() => !!this.session.currentUser()?.supplierId);

  /** Figures of a supplier: the needs it can answer, its catalog and the state of its orders. */
  readonly supplierSummary = computed<SupplierSummary>(() => {
    const orders = this.procurements.shipmentItems();
    const count = (status: string) => orders.filter(order => order.status === status).length;
    return {
      needs: this.requisition.requestCount(),
      offered: this.suppliers.myOfferings().length,
      pending: count('pending'),
      accepted: count('accepted'),
      rejected: count('rejected')
    };
  });

  /** What the administrator should look at first: expirations, shortages and pending orders. */
  readonly attention = computed<AttentionSummary>(() => ({
    expiring: this.inventory.expiringItems().length,
    shortages: this.inventory.shortages().length,
    pendingOrders: this.procurements.pendingCount()
  }));

  /** Figures of the summary cards. */
  readonly summary = computed<DashboardSummary>(() => ({
    health: this.analytics.indicators()?.operationalHealth.value ?? null,
    units: this.inventory.totalUnits(),
    requests: this.requisition.requestCount(),
    pendingShipments: this.procurements.pendingCount()
  }));

  /** Most relevant recent events: the lot closest to expiring, the last accepted request and a healthy sensor. */
  readonly activity = computed<ActivityEntry[]>(() => {
    const entries: ActivityEntry[] = [];

    if (this.isSupplier()) {
      const answered = this.procurements.shipmentItems().filter(order => order.decidedOn);
      const latest = answered.sort((a, b) => b.decidedOn!.toString().localeCompare(a.decidedOn!.toString()))[0];
      if (latest) {
        entries.push({
          kind: latest.status === 'accepted' ? 'order-accepted' : 'order-rejected',
          tone: latest.status === 'accepted' ? 'info' : 'urgent',
          params: {order: latest.id, minimarket: latest.minimarketName}
        });
      }
      return entries;
    }

    const closest = [...this.inventory.expiringItems()].sort((a, b) => a.daysToExpire - b.daysToExpire)[0];
    if (closest) {
      entries.push({
        kind: 'expiration',
        tone: 'urgent',
        params: {product: closest.productName, days: Math.max(closest.daysToExpire, 0)}
      });
    }

    const accepted = this.requisition.latestAcceptedRequest();
    if (accepted) {
      entries.push({kind: 'request', tone: 'info', params: {supplier: accepted.supplierName}});
    }

    const healthy = this.conservation.readingItems().find(reading => reading.status === 'normal');
    if (healthy) {
      entries.push({kind: 'sensor', tone: 'info', params: {zone: healthy.zoneName}});
    }

    return entries;
  });

  /**
   * Loads everything the dashboard shows.
   */
  loadDashboard(): void {
    this.analytics.loadAnalytics();
    this.inventory.loadInventory();
    this.requisition.loadRequisition();
    this.procurements.loadProcurements();
    this.conservation.loadConservation();
    this.suppliers.loadSuppliers();
  }
}
