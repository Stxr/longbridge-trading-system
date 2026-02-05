import { BaseStrategy } from './base-strategy';
import { KLine, Quote, Order } from '../../shared/models/market-data';

export class HelloWorldStrategy extends BaseStrategy {
  constructor() {
    super('HelloWorldStrategy');
  }

  async onInit(): Promise<void> {
    console.log(`[${this.name}] Initialized in ${this.context.mode} mode`);
    if (this.context.mode === 'backtest') {
      console.log(`[${this.name}] Placing a test order...`);
      const orderId = await this.context.submitOrder({
        symbol: '700.HK',
        side: 'Buy',
        price: 300,
        quantity: 100,
      });
      console.log(`[${this.name}] Test order placed: ${orderId}`);
    }
  }

  async onData(kline: KLine): Promise<void> {
    console.log(`[${this.name}] Received KLine: ${kline.symbol} @ ${kline.close}`);
  }

  async onQuote(quote: Quote): Promise<void> {
    console.log(`[${this.name}] Received Quote: ${quote.symbol} @ ${quote.lastPrice}`);
  }

  async onOrderUpdate(order: Order): Promise<void> {
    console.log(`[${this.name}] Order Update: ${order.orderId} status is ${order.status}`);
  }

  async onStop(): Promise<void> {
    console.log(`[${this.name}] Strategy stopped`);
  }
}
