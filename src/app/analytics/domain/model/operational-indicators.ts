import {DomainError} from '../../../shared/domain/model/domain-error';
import {Money} from '../../../shared/domain/model/money';
import {Percentage} from '../../../shared/domain/model/percentage';

/**
 * Key figures that summarize how well the minimarket operates.
 */
export class OperationalIndicators {
  /**
   * @param avoidedLoss - Money saved by acting on alerts before products were lost.
   * @param productsAtRisk - Products that are close to expiring or losing their quality.
   * @param acceptedRequestsRate - Share of supply requests accepted by suppliers.
   * @param operationalHealth - Overall health of the operation.
   * @throws DomainError if the number of products at risk is not a non-negative integer.
   */
  constructor(
    readonly avoidedLoss: Money,
    readonly productsAtRisk: number,
    readonly acceptedRequestsRate: Percentage,
    readonly operationalHealth: Percentage
  ) {
    if (!Number.isInteger(productsAtRisk) || productsAtRisk < 0) {
      throw new DomainError('Products at risk must be a non-negative integer');
    }
  }
}
