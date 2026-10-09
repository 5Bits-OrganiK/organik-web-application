import {CalendarDate} from '../../shared/domain/model/calendar-date';
import {InventoryEventType} from '../domain/model/inventory-event';
import {StockStatus} from '../domain/model/stock-status';

/**
 * Read model of one inventory row: a stock lot joined with its product.
 */
export interface InventoryItem {
  /** SKU of the product. */
  sku: string;
  productName: string;
  /** Category of the product, empty when the product is unknown. */
  categoryId: string;
  lotCode: string;
  quantity: number;
  expiresOn: CalendarDate;
  daysToExpire: number;
  status: StockStatus;
  location: string;
}

/**
 * Read model of a product whose stock is under its minimum.
 */
export interface StockShortage {
  sku: string;
  productName: string;
  stock: number;
  minimum: number;
}

/**
 * Read model of one entry of the inventory history.
 */
export interface InventoryEventItem {
  id: string;
  type: InventoryEventType;
  productName: string;
  lotCode: string | null;
  quantity: number | null;
  cause: string;
  detail: string;
  actorName: string;
  occurredOn: CalendarDate;
}

/**
 * Read model of one offer.
 */
export interface OfferItem {
  id: string;
  productName: string;
  quantity: number;
  validUntil: CalendarDate;
  createdBy: string;
  active: boolean;
}
