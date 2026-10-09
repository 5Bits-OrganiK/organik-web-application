import {inject, Injectable} from '@angular/core';
import {map, Observable} from 'rxjs';
import {respondWith} from '../../shared/infrastructure/in-memory-gateway';
import {AlertTrend} from '../domain/model/alert-trend';
import {OperationalIndicators} from '../domain/model/operational-indicators';
import {ALERT_TREND_SEED, INDICATORS_SEED} from './analytics-seed';
import {IndicatorsAssembler} from './indicators-assembler';

@Injectable({providedIn: 'root'})
/**
 * Infrastructure gateway to the analytics backend.
 *
 * @remarks
 * Until the backend exists, figures come from in-memory data. The gateway still returns
 * domain objects by delegating resource mapping to the assembler.
 */
export class AnalyticsApi {
  private readonly assembler = inject(IndicatorsAssembler);

  /**
   * Fetches the operational indicators.
   */
  getIndicators(): Observable<OperationalIndicators> {
    return respondWith(structuredClone(INDICATORS_SEED)).pipe(
      map(resource => this.assembler.toIndicatorsFromResource(resource))
    );
  }

  /**
   * Fetches the alerts raised per week.
   */
  getAlertTrend(): Observable<AlertTrend> {
    return respondWith(structuredClone(ALERT_TREND_SEED)).pipe(
      map(response => this.assembler.toTrendFromResponse(response))
    );
  }
}
