import {Component, computed, input} from '@angular/core';
import {MatIcon} from '@angular/material/icon';
import {TranslatePipe} from '@ngx-translate/core';
import {ProductCategory} from '../../../domain/model/product-category';

/** Icon that represents each category in the catalog. */
const CATEGORY_ICONS: Readonly<Record<string, string>> = {
  'fruits-vegetables': 'eco',
  dairy: 'water_drop',
  grains: 'grass',
  beverages: 'local_cafe',
  bakery: 'bakery_dining',
  frozen: 'ac_unit'
};

@Component({
  imports: [MatIcon, TranslatePipe],
  selector: 'app-category-card',
  styleUrl: './category-card.css',
  templateUrl: './category-card.html',
})
/**
 * Presentation component that shows one product category of the catalog.
 */
export class CategoryCard {
  /** Category to display. */
  category = input.required<ProductCategory>();

  protected readonly icon = computed(() => CATEGORY_ICONS[this.category().id] ?? 'eco');
}
