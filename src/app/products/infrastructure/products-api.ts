import {inject, Injectable} from '@angular/core';
import {map, Observable, switchMap} from 'rxjs';
import {FakeApi, mergeByKey} from '../../shared/infrastructure/fake-api';
import {respondWith} from '../../shared/infrastructure/in-memory-gateway';
import {Product} from '../domain/model/product.entity';
import {ProductCategory} from '../domain/model/product-category';
import {CATEGORIES_SEED, PRODUCTS_SEED} from './products-seed';
import {CategoryAssembler} from './category-assembler';
import {ProductAssembler} from './product-assembler';
import {ProductResource} from './products-response';

@Injectable({providedIn: 'root'})
/**
 * Infrastructure gateway to the products backend.
 *
 * @remarks
 * Until the backend exists, resources are kept in memory. The gateway still returns
 * domain entities by delegating resource mapping to assembler classes.
 */
export class ProductsApi {
  private readonly categoryAssembler = inject(CategoryAssembler);
  private readonly productAssembler = inject(ProductAssembler);
  private readonly fakeApi = inject(FakeApi);
  private readonly productResources: ProductResource[] = structuredClone(PRODUCTS_SEED);

  /**
   * Fetches every product category.
   */
  getCategories(): Observable<ProductCategory[]> {
    return respondWith({categories: structuredClone(CATEGORIES_SEED)}).pipe(
      map(response => this.categoryAssembler.toEntitiesFromResponse(response))
    );
  }

  /**
   * Fetches every product of the catalog.
   */
  getProducts(): Observable<Product[]> {
    return this.fakeApi.list<ProductResource>('products').pipe(
      switchMap(remote => {
        const merged = mergeByKey(this.productResources, remote, resource => resource.id);
        this.productResources.splice(0, this.productResources.length, ...merged);
        return respondWith({products: structuredClone(merged)});
      }),
      map(response => this.productAssembler.toEntitiesFromResponse(response))
    );
  }

  /**
   * Replaces the stored version of a product.
   *
   * @param product - Updated product entity.
   */
  updateProduct(product: Product): Observable<Product> {
    const index = this.productResources.findIndex(resource => resource.id === product.id);
    this.productResources[index] = this.productAssembler.toResourceFromEntity(product);
    return respondWith(product);
  }

  /**
   * Persists a new product.
   *
   * @param product - Product entity to store.
   */
  createProduct(product: Product): Observable<Product> {
    const resource = this.productAssembler.toResourceFromEntity(product);
    this.productResources.push(resource);
    return this.fakeApi.create('products', resource).pipe(switchMap(() => respondWith(product)));
  }
}
