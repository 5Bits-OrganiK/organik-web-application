import {Component, computed, inject, input, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {SuppliersStore} from '../../../application/suppliers.store';

@Component({
  imports: [
    RouterLink,
    MatAnchor,
    TranslatePipe
  ],
  selector: 'app-supplier-detail',
  styleUrl: './supplier-detail.css',
  templateUrl: './supplier-detail.html',
})
/**
 * View with the full profile of one supplier.
 */
export class SupplierDetail implements OnInit {
  private readonly store = inject(SuppliersStore);

  /** Supplier identifier bound from the route. */
  id = input.required<string>();

  /** Supplier to show, or `undefined` while loading or when it does not exist. */
  protected readonly supplier = computed(() => this.store.findById(this.id()));

  /** Read-only list of the products the supplier offers, with their availability. */
  protected readonly catalog = computed(() => this.store.offeringsOf(this.id()));

  ngOnInit(): void {
    this.store.loadSuppliers();
  }
}
