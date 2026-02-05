import { Order, OrderStatusSchema, OrderSideSchema, MarketSchema, KLine } from '../../shared/models/market-data';
import { ITradeProvider } from '../trading-mode-manager';
import { SlippageModel, CommissionModel, FixedSlippageModel, FixedCommissionModel } from './models';

export class OrderSimulator implements ITradeProvider {
  private pendingOrders: Order[] = [];
  private allOrders: Order[] = [];
  private onOrderUpdate?: (order: Order) => void;
  private slippageModel: SlippageModel;
  private commissionModel: CommissionModel;

  constructor(
    onOrderUpdate?: (order: Order) => void,
    slippageModel: SlippageModel = new FixedSlippageModel(),
    commissionModel: CommissionModel = new FixedCommissionModel()
  ) {
    this.onOrderUpdate = onOrderUpdate;
    this.slippageModel = slippageModel;
    this.commissionModel = commissionModel;
  }

  async submitOrder(options: {
    symbol: string;
    side: 'Buy' | 'Sell';
    price?: number;
    quantity: number;
  }): Promise<string> {
    const order: Order = {
      orderId: `sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      symbol: options.symbol,
      market: 'HK', // Default for now
      side: options.side,
      price: options.price,
      quantity: options.quantity,
      executedQuantity: 0,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.allOrders.push(order);
    this.pendingOrders.push(order);
    this.onOrderUpdate?.(order);
    return order.orderId;
  }

  async cancelOrder(orderId: string): Promise<void> {
    const order = this.pendingOrders.find((o) => o.orderId === orderId);
    if (order) {
      order.status = 'Cancelled';
      order.updatedAt = new Date().toISOString();
      this.pendingOrders = this.pendingOrders.filter((o) => o.orderId !== orderId);
      this.onOrderUpdate?.(order);
    }
  }

  processKLine(kline: KLine) {
    const executedOrders: Order[] = [];

    for (const order of this.pendingOrders) {
      if (order.symbol !== kline.symbol) {
        continue;
      }

      let filled = false;
      let fillPrice = 0;

      if (!order.price) {
        // Market Order
        filled = true;
        fillPrice = this.slippageModel.calculateFillPrice(undefined, kline.open, order.side);
      } else {
        // Limit Order
        if (order.side === 'Buy') {
          if (kline.low <= order.price) {
            filled = true;
            fillPrice = this.slippageModel.calculateFillPrice(order.price, kline.open, order.side);
          }
        } else {
          if (kline.high >= order.price) {
            filled = true;
            fillPrice = this.slippageModel.calculateFillPrice(order.price, kline.open, order.side);
          }
        }
      }

      if (filled) {
        order.status = 'Filled';
        order.executedQuantity = order.quantity;
        order.price = fillPrice; // Actual fill price
        order.commission = this.commissionModel.calculateCommission(order.executedQuantity, fillPrice);
        order.updatedAt = kline.timestamp;
        executedOrders.push(order);
        this.onOrderUpdate?.(order);
      }
    }

    this.pendingOrders = this.pendingOrders.filter((o) => !executedOrders.includes(o));
  }
}