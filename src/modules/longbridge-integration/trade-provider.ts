import {
  TradeContext,
  SubmitOrderOptions,
  OrderType,
  OrderSide,
  TimeInForceType,
  Decimal,
  PushOrderChanged,
  TopicType,
  OrderStatus as SDKOrderStatus,
} from 'longport';
import { LongbridgeClient } from './client';
import { Order, OrderStatusSchema, OrderSideSchema, MarketSchema } from '../../shared/models/market-data';
import { RateLimiter } from '../../shared/utils/rate-limiter';

export class TradeProvider {
  private client: LongbridgeClient;
  private onOrderUpdateCallback?: (order: Order) => void;
  private rateLimiter: RateLimiter;

  constructor(client: LongbridgeClient) {
    this.client = client;
    // Longbridge Trade API limit: 30 calls per 30 seconds
    this.rateLimiter = new RateLimiter(30, 30000);
  }

  async init() {
    const ctx = await this.client.getTradeContext();
    ctx.setOnOrderChanged((err, event) => {
      if (err) return console.error('Order Change Error:', err);
      this.handleOrderChange(event);
    });
    await ctx.subscribe([TopicType.Private]);
  }

  async submitOrder(options: {
    symbol: string;
    side: 'Buy' | 'Sell';
    price?: number;
    quantity: number;
  }): Promise<string> {
    await this.rateLimiter.acquire();
    const ctx = await this.client.getTradeContext();
    const resp = await ctx.submitOrder({
      symbol: options.symbol,
      orderType: options.price ? OrderType.LO : OrderType.MO,
      side: options.side === 'Buy' ? OrderSide.Buy : OrderSide.Sell,
      timeInForce: TimeInForceType.Day,
      submittedPrice: options.price ? new Decimal(options.price.toString()) : undefined,
      submittedQuantity: new Decimal(options.quantity.toString()),
    });
    return resp.orderId;
  }

  async cancelOrder(orderId: string) {
    await this.rateLimiter.acquire();
    const ctx = await this.client.getTradeContext();
    await ctx.cancelOrder(orderId);
  }

  setOnOrderUpdate(callback: (order: Order) => void) {
    this.onOrderUpdateCallback = callback;
  }

  private handleOrderChange(event: PushOrderChanged) {
    const [symbol, marketStr] = event.symbol.split('.');
    const order: Order = {
      orderId: event.orderId,
      symbol,
      market: MarketSchema.parse(marketStr),
      side: event.side === OrderSide.Buy ? 'Buy' : 'Sell',
      price: event.submittedPrice ? Number(event.submittedPrice) : undefined,
      quantity: Number(event.submittedQuantity),
      executedQuantity: Number(event.executedQuantity),
      status: this.mapOrderStatus(event.status),
      createdAt: event.submittedAt.toISOString(),
      updatedAt: event.updatedAt.toISOString(),
    };
    this.onOrderUpdateCallback?.(order);
  }

  private mapOrderStatus(status: SDKOrderStatus): any {
    switch (status) {
      case SDKOrderStatus.NotReported:
      case SDKOrderStatus.ReplacedNotReported:
      case SDKOrderStatus.ProtectedNotReported:
      case SDKOrderStatus.VarietiesNotReported:
        return 'Pending';
      case SDKOrderStatus.New:
        return 'Submitted';
      case SDKOrderStatus.PartialFilled:
        return 'PartiallyFilled';
      case SDKOrderStatus.Filled:
        return 'Filled';
      case SDKOrderStatus.Canceled:
      case SDKOrderStatus.Expired:
        return 'Cancelled';
      case SDKOrderStatus.Rejected:
        return 'Rejected';
      default:
        return 'Pending';
    }
  }
}