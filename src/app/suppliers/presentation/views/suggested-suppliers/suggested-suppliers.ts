import {Component, inject, OnInit} from '@angular/core';
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
  selector: 'app-suggested-suppliers',
  styleUrl: './suggested-suppliers.css',
  templateUrl: './suggested-suppliers.html',
})
/**
 * View with the suppliers recommended to resolve the active alerts.
 */
export class SuggestedSuppliers implements OnInit {
  private readonly store = inject(SuppliersStore);

  /** Recommended suppliers grouped by the alert situation they solve. */
  protected readonly suggestions = this.store.suggestions;

  ngOnInit(): void {
    this.store.loadSuppliers();
  }
}
