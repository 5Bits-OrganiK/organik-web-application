import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {Clock} from '../../shared/domain/services/clock';
import {respondWith} from '../../shared/infrastructure/in-memory-gateway';
import {SupplyRequest} from '../domain/model/supply-request.entity';
import {SupplyRequestResource} from './requisition-response';
import {supplyRequestsSeed} from './requisition-seed';
import {SupplyRequestAssembler} from './supply-request-assembler';

@Injectable({providedIn: 'root'})
/**
 * Infrastructure gateway to the requisition backend.
 *
 * @remarks
 * Until the backend exists, resources are kept in memory. The gateway still returns
 * domain entities by delegating resource mapping to the assembler.
 */
export class RequisitionApi {
  private readonly assembler = inject(SupplyRequestAssembler);
  private readonly resources: SupplyRequestResource[] = supplyRequestsSeed(inject(Clock).today());

  /**
   * Fetches every supply request.
   */
  getSupplyRequests(): Observable<SupplyRequest[]> {
    return respondWith({requests: structuredClone(this.resources)}).pipe(
      map(response => this.assembler.toEntitiesFromResponse(response))
    );
  }

  /**
   * Persists a new supply request.
   *
   * @param request - Request entity to store.
   */
  createSupplyRequest(request: SupplyRequest): Observable<SupplyRequest> {
    this.resources.push(this.assembler.toResourceFromEntity(request));
    return respondWith(request);
  }
}
