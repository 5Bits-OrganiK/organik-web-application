import {DomainError} from '../../../shared/domain/model/domain-error';
import {StorageCondition} from '../../../shared/domain/model/storage-condition';
import {ConservationRange} from './conservation-range';

/**
 * Represents an area of the minimarket where products are kept under a storage condition.
 */
export class StorageZone {
  /** Range the zone must keep, derived from its storage condition. */
  readonly range: ConservationRange;

  /**
   * @param id - Stable identifier of the zone.
   * @param name - Name shown to the user, e.g. "Cámara fría A".
   * @param condition - Storage condition the zone provides.
   * @throws DomainError if the identifier or the name is blank.
   */
  constructor(
    readonly id: string,
    readonly name: string,
    readonly condition: StorageCondition
  ) {
    if (!id.trim() || !name.trim()) {
      throw new DomainError('A storage zone needs an identifier and a name');
    }
    this.range = ConservationRange.forCondition(condition);
  }
}
