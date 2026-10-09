import {Injectable} from '@angular/core';
import {CategoryTone, ProductCategory} from '../domain/model/product-category';
import {CategoriesResponse, CategoryResource} from './products-response';

const TONES: readonly CategoryTone[] = ['green', 'blue', 'orange', 'yellow', 'neutral'];

/**
 * Maps category resources from the backend into ProductCategory domain entities.
 */
@Injectable({providedIn: 'root'})
export class CategoryAssembler {
  /**
   * Converts a category resource into a ProductCategory entity.
   *
   * @param resource - Raw category object returned by the backend.
   */
  toEntityFromResource(resource: CategoryResource): ProductCategory {
    const tone = TONES.find(candidate => candidate === resource.tone) ?? 'neutral';
    return new ProductCategory(resource.id, tone);
  }

  /**
   * Converts a categories payload into ProductCategory entities.
   *
   * @param response - Backend response with category resources.
   */
  toEntitiesFromResponse(response: CategoriesResponse): ProductCategory[] {
    return response.categories.map(resource => this.toEntityFromResource(resource));
  }
}
