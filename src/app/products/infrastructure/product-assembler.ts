import {Injectable} from '@angular/core';
import {Quantity} from '../../shared/domain/model/quantity';
import {STORAGE_CONDITIONS, StorageCondition} from '../../shared/domain/model/storage-condition';
import {MEASUREMENT_UNITS, MeasurementUnit} from '../domain/model/measurement-unit';
import {Product} from '../domain/model/product.entity';
import {ProductResource, ProductsResponse} from './products-response';

/**
 * Maps product resources from the backend into Product domain entities and back.
 */
@Injectable({providedIn: 'root'})
export class ProductAssembler {
  /**
   * Converts a product resource into a Product entity.
   *
   * @param resource - Raw product object returned by the backend.
   */
  toEntityFromResource(resource: ProductResource): Product {
    return new Product({
      id: resource.id,
      name: resource.name,
      categoryId: resource.categoryId,
      supplierId: resource.supplierId,
      unit: MEASUREMENT_UNITS.find(unit => unit === resource.unit) ?? 'unit',
      minimumStock: Quantity.of(resource.minimumStock),
      storageCondition:
        STORAGE_CONDITIONS.find(condition => condition === resource.storageCondition) ?? 'fresh'
    });
  }

  /**
   * Converts a products payload into Product entities.
   *
   * @param response - Backend response with product resources.
   */
  toEntitiesFromResponse(response: ProductsResponse): Product[] {
    return response.products.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts a Product entity into the resource sent to the backend.
   *
   * @param product - Entity to serialize.
   */
  toResourceFromEntity(product: Product): ProductResource {
    return {
      id: product.id,
      name: product.name,
      categoryId: product.categoryId,
      supplierId: product.supplierId,
      unit: product.unit satisfies MeasurementUnit,
      minimumStock: product.minimumStock.value,
      storageCondition: product.storageCondition satisfies StorageCondition
    };
  }
}
