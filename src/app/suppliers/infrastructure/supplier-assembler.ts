import {Injectable} from '@angular/core';
import {EmailAddress} from '../../shared/domain/model/email-address';
import {Supplier} from '../domain/model/supplier.entity';
import {SUPPLIER_SPECIALTIES, SupplierSpecialty} from '../domain/model/supplier-specialty';
import {SupplierResource, SuppliersResponse} from './suppliers-response';

/**
 * Maps supplier resources from the backend into Supplier domain entities and back.
 */
@Injectable({providedIn: 'root'})
export class SupplierAssembler {
  /**
   * Converts a supplier resource into a Supplier entity.
   *
   * @param resource - Raw supplier object returned by the backend.
   */
  toEntityFromResource(resource: SupplierResource): Supplier {
    return new Supplier({
      id: resource.id,
      businessName: resource.businessName,
      contactName: resource.contactName,
      phone: resource.phone,
      email: new EmailAddress(resource.email),
      categories: resource.categories,
      organicCertification: resource.organicCertification,
      specialties: resource.specialties.filter((value): value is SupplierSpecialty =>
        SUPPLIER_SPECIALTIES.includes(value as SupplierSpecialty)
      )
    });
  }

  /**
   * Converts a suppliers payload into Supplier entities.
   *
   * @param response - Backend response with supplier resources.
   */
  toEntitiesFromResponse(response: SuppliersResponse): Supplier[] {
    return response.suppliers.map(resource => this.toEntityFromResource(resource));
  }

  /**
   * Converts a Supplier entity into the resource sent to the backend.
   *
   * @param supplier - Entity to serialize.
   */
  toResourceFromEntity(supplier: Supplier): SupplierResource {
    return {
      id: supplier.id,
      businessName: supplier.businessName,
      contactName: supplier.contactName,
      phone: supplier.phone,
      email: supplier.email.toString(),
      categories: [...supplier.categories],
      organicCertification: supplier.organicCertification,
      specialties: [...supplier.specialties]
    };
  }
}
