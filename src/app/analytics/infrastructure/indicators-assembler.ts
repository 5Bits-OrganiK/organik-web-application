import {Injectable} from '@angular/core';
import {Money} from '../../shared/domain/model/money';
import {Percentage} from '../../shared/domain/model/percentage';
import {AlertTrend} from '../domain/model/alert-trend';
import {OperationalIndicators} from '../domain/model/operational-indicators';
import {AlertTrendResponse, IndicatorsResource} from './analytics-response';

/**
 * Maps analytics resources from the backend into domain objects.
 */
@Injectable({providedIn: 'root'})
export class IndicatorsAssembler {
  /**
   * Converts an indicators resource into OperationalIndicators.
   *
   * @param resource - Raw indicators object returned by the backend.
   */
  toIndicatorsFromResource(resource: IndicatorsResource): OperationalIndicators {
    return new OperationalIndicators(
      Money.of(resource.avoidedLoss),
      resource.productsAtRisk,
      Percentage.of(resource.acceptedRequestsRate),
      Percentage.of(resource.operationalHealth)
    );
  }

  /**
   * Converts an alert trend payload into an AlertTrend.
   *
   * @param response - Backend response with the trend points.
   */
  toTrendFromResponse(response: AlertTrendResponse): AlertTrend {
    return new AlertTrend(response.points);
  }
}
