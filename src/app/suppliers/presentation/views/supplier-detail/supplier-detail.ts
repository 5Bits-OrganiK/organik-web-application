import {DatePipe} from '@angular/common';
import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {TranslatePipe} from '@ngx-translate/core';
import {SuppliersStore} from '../../../application/suppliers.store';

@Component({
  imports: [
    RouterLink,
    MatAnchor,
    DatePipe, TranslatePipe
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
  private readonly route = inject(ActivatedRoute);

  /** Supplier identifier, read from the route. */
  protected readonly id = signal('');

  /** Supplier to show, or `undefined` while loading or when it does not exist. */
  protected readonly supplier = computed(() => this.store.findById(this.id()));

  /** Read-only list of the products the supplier offers, with their availability. */
  protected readonly catalog = computed(() => this.store.offeringsOf(this.id()));

  constructor() {
    this.route.params.subscribe(params => this.id.set(params['id']));
  }

  ngOnInit(): void {
    this.store.loadSuppliers();
  }
}
