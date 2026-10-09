import {BadgeTone} from '../../shared/presentation/components/status-badge/status-badge';
import {OrderStatus} from '../domain/model/shipment-order.entity';

/**
 * Badge tone that represents each order status.
 */
export const ORDER_STATUS_TONE: Readonly<Record<OrderStatus, BadgeTone>> = {
  pending: 'warning',
  accepted: 'success',
  rejected: 'danger'
};
