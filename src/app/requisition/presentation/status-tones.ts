import {BadgeTone} from '../../shared/presentation/components/status-badge/status-badge';
import {RequestStatus} from '../domain/model/supply-request.entity';

/**
 * Badge tone that represents each supply request status.
 */
export const REQUEST_STATUS_TONE: Readonly<Record<RequestStatus, BadgeTone>> = {
  pending: 'warning',
  accepted: 'info',
  rejected: 'danger'
};
