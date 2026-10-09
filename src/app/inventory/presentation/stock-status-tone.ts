import {BadgeTone} from '../../shared/presentation/components/status-badge/status-badge';
import {StockStatus} from '../domain/model/stock-status';

/**
 * Badge tone that represents each stock status.
 */
export const STOCK_STATUS_TONE: Readonly<Record<StockStatus, BadgeTone>> = {
  normal: 'info',
  risk: 'warning',
  critical: 'danger'
};
