import {Supplier} from '../model/supplier.entity';
import {SUPPLIER_SPECIALTIES, SupplierSpecialty} from '../model/supplier-specialty';

/**
 * Suppliers recommended to resolve one kind of active alert.
 */
export interface SupplierSuggestion {
  reason: SupplierSpecialty;
  suppliers: readonly Supplier[];
}

/**
 * Domain service that matches alert situations with the suppliers able to solve them.
 */
export class SupplierSuggestionService {
  /**
   * Groups suppliers by the situation they are recommended for.
   *
   * @param suppliers - Candidate suppliers.
   * @returns One group per specialty that has at least one supplier, in presentation order.
   */
  suggest(suppliers: readonly Supplier[]): SupplierSuggestion[] {
    return SUPPLIER_SPECIALTIES.map(reason => ({
      reason,
      suppliers: suppliers.filter(supplier => supplier.hasSpecialty(reason))
    })).filter(suggestion => suggestion.suppliers.length > 0);
  }
}
