import {Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {MatAnchor} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {ProductsStore} from '../../../application/products.store';
import {CategoryCard} from '../../components/category-card/category-card';

@Component({
  imports: [
    RouterLink,
    MatAnchor,
    MatIcon,
    TranslatePipe,
    CategoryCard
  ],
  selector: 'app-product-categories',
  styleUrl: './product-categories.css',
  templateUrl: './product-categories.html',
})
/**
 * View with the product categories of the catalog.
 */
export class ProductCategories implements OnInit {
  private readonly store = inject(ProductsStore);

  /** Categories shown in the catalog. */
  protected readonly categories = this.store.categories;

  ngOnInit(): void {
    this.store.loadProducts();
  }
}
