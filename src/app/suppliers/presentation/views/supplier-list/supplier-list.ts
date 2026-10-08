import {Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {SuppliersStore} from '../../../application/suppliers.store';
import {SupplierCard} from '../../components/supplier-card/supplier-card';

@Component({
  imports: [
    RouterLink,
    MatAnchor,
    MatIcon,
    TranslatePipe,
    SupplierCard
  ],
  selector: 'app-supplier-list',
  styleUrl: './supplier-list.css',
  templateUrl: './supplier-list.html',
})
/**
 * View listing the suppliers of the minimarket.
 */
export class SupplierList implements OnInit {
  private readonly store = inject(SuppliersStore);

  /** Suppliers shown in the directory. */
  protected readonly suppliers = this.store.suppliers;

  ngOnInit(): void {
    this.store.loadSuppliers();
  }
}
