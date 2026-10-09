import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {Clock} from '../../shared/domain/services/clock';
import {respondWith} from '../../shared/infrastructure/in-memory-gateway';
import {OfferedProduct} from '../domain/model/offered-product.entity';
import {Supplier} from '../domain/model/supplier.entity';
import {OfferedProductAssembler} from './offered-product-assembler';
import {SupplierAssembler} from './supplier-assembler';
import {OfferedProductResource, SupplierResource, SuppliersResponse} from './suppliers-response';
import {offeredProductsSeed, SUPPLIERS_SEED} from './suppliers-seed';

@Injectable({providedIn: 'root'})
/**
 * Infrastructure gateway to the suppliers backend.
 *
 * @remarks
 * Until the backend exists, resources are kept in memory. The gateway still returns
 * domain entities by delegating resource mapping to the assembler.
 */
export class SuppliersApi {
  private readonly assembler = inject(SupplierAssembler);
  private readonly offeredAssembler = inject(OfferedProductAssembler);
  private readonly resources: SupplierResource[] = structuredClone(SUPPLIERS_SEED);
  private readonly offeredResources: OfferedProductResource[] = offeredProductsSeed(inject(Clock).today());

  /**
   * Fetches every supplier and maps it into domain entities.
   */
  getSuppliers(): Observable<Supplier[]> {
    const response: SuppliersResponse = {suppliers: structuredClone(this.resources)};
    return respondWith(response).pipe(map(r => this.assembler.toEntitiesFromResponse(r)));
  }

  /**
   * Persists a new supplier.
   *
   * @param supplier - Supplier entity to store.
   */
  createSupplier(supplier: Supplier): Observable<Supplier> {
    this.resources.push(this.assembler.toResourceFromEntity(supplier));
    return respondWith(supplier);
  }

  /**
   * Fetches every product the suppliers offer.
   */
  getOfferedProducts(): Observable<OfferedProduct[]> {
    return respondWith({offeredProducts: structuredClone(this.offeredResources)}).pipe(
      map(response => this.offeredAssembler.toEntitiesFromResponse(response))
    );
  }

  /**
   * Persists a new offered product.
   *
   * @param offered - Entity to store.
   */
  createOfferedProduct(offered: OfferedProduct): Observable<OfferedProduct> {
    this.offeredResources.push(this.offeredAssembler.toResourceFromEntity(offered));
    return respondWith(offered);
  }

  /**
   * Replaces the stored version of an offered product.
   *
   * @param offered - Updated entity.
   */
  updateOfferedProduct(offered: OfferedProduct): Observable<OfferedProduct> {
    const index = this.offeredResources.findIndex(resource => resource.id === offered.id);
    this.offeredResources[index] = this.offeredAssembler.toResourceFromEntity(offered);
    return respondWith(offered);
  }
}
