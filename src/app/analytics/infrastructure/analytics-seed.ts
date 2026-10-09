import {AlertTrendResponse, IndicatorsResource} from './analytics-response';

/**
 * Operational indicators while the backend is not available.
 */
export const INDICATORS_SEED: IndicatorsResource = {
  avoidedLoss: 1820,
  productsAtRisk: 14,
  acceptedRequestsRate: 72,
  operationalHealth: 87
};

/**
 * Alerts raised per week while the backend is not available.
 */
export const ALERT_TREND_SEED: AlertTrendResponse = {
  points: [
    {label: 'S1', count: 8},
    {label: 'S2', count: 12},
    {label: 'S3', count: 9},
    {label: 'S4', count: 17},
    {label: 'S5', count: 14},
    {label: 'S6', count: 21}
  ]
};
