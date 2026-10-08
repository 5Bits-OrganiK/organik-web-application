import {DomainError} from '../../../shared/domain/model/domain-error';
import {EmailAddress} from '../../../shared/domain/model/email-address';
import {SupplierSpecialty} from './supplier-specialty';

/**
 * Data required to build a {@link Supplier}.
 */
export interface SupplierProps {
  id: string;
  businessName: string;
  contactName: string;
  phone: string;
  email: EmailAddress;
  categories: readonly string[];
  organicCertification: string;
  specialties: readonly SupplierSpecialty[];
}

/**
 * Represents an organic products supplier in the Suppliers bounded context.
 */
export class Supplier {
  /** Stable identifier of the supplier. */
  readonly id: string;
  /** Legal name shown in listings. */
  readonly businessName: string;
  /** Person the minimarket talks to. */
  readonly contactName: string;
  readonly phone: string;
  readonly email: EmailAddress;
  /** Product categories the supplier provides. */
  readonly categories: readonly string[];
  /** Organic certification the supplier holds. */
  readonly organicCertification: string;
  /** Situations the supplier is recommended for. */
  readonly specialties: readonly SupplierSpecialty[];

  /**
   * @throws DomainError if the identifier, name or certification is blank.
   */
  constructor(props: SupplierProps) {
    for (const [field, value] of Object.entries({
      id: props.id,
      businessName: props.businessName,
      contactName: props.contactName,
      organicCertification: props.organicCertification
    })) {
      if (!value.trim()) {
        throw new DomainError(`Supplier ${field} is required`);
      }
    }
    this.id = props.id;
    this.businessName = props.businessName.trim();
    this.contactName = props.contactName.trim();
    this.phone = props.phone.trim();
    this.email = props.email;
    this.categories = props.categories.map(category => category.trim()).filter(Boolean);
    this.organicCertification = props.organicCertification.trim();
    this.specialties = props.specialties;
  }

  /** Two-letter monogram used as the supplier avatar. */
  get initials(): string {
    return this.businessName.replace(/\s+/g, '').slice(0, 2).toUpperCase();
  }

  /** Whether the supplier is recommended for the given situation. */
  hasSpecialty(specialty: SupplierSpecialty): boolean {
    return this.specialties.includes(specialty);
  }
}
