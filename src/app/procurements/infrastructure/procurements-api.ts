import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {Clock} from '../../shared/domain/services/clock';
import {respondWith} from '../../shared/infrastructure/in-memory-gateway';
import {ShipmentOrder} from '../domain/model/shipment-order.entity';
import {ShipmentOrderResource} from './procurements-response';
import {shipmentOrdersSeed} from './procurements-seed';
import {ShipmentOrderAssembler} from './shipment-order-assembler';

@Injectable({providedIn: 'root'})
/**
 * Infrastructure gateway to the procurements backend.
 *
 * @remarks
 * Until the backend exists, resources are kept in memory. The gateway still returns
 * domain entities by delegating resource mapping to the assembler.
 */
export class ProcurementsApi {
  private readonly assembler = inject(ShipmentOrderAssembler);
  private readonly resources: ShipmentOrderResource[] = shipmentOrdersSeed(inject(Clock).today());

  /**
   * Fetches every order.
   */
  getShipmentOrders(): Observable<ShipmentOrder[]> {
    return respondWith({shipments: structuredClone(this.resources)}).pipe(
      map(response => this.assembler.toEntitiesFromResponse(response))
    );
  }

  /**
   * Stores a new order.
   *
   * @param order - Order entity to create.
   */
  createShipmentOrder(order: ShipmentOrder): Observable<ShipmentOrder> {
    this.resources.push(this.assembler.toResourceFromEntity(order));
    return respondWith(order);
  }

  /**
   * Replaces the stored version of an order.
   *
   * @param order - Updated order entity.
   */
  updateShipmentOrder(order: ShipmentOrder): Observable<ShipmentOrder> {
    const index = this.resources.findIndex(resource => resource.id === order.id);
    this.resources[index] = this.assembler.toResourceFromEntity(order);
    return respondWith(order);
  }
}
