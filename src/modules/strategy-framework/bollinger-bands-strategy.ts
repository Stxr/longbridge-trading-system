import { BaseStrategy } from './base-strategy';
import { KLine, Quote, Order } from '../../shared/models/market-data';

export class BollingerBandsStrategy extends BaseStrategy {
  private period: number;
  private stdDevMultiplier: number;
  private quantity: number;
  private targetSymbol: string;
  private history: number[] = [];
  private hasPosition: boolean = false;

  constructor(
    targetSymbol: string,
    period: number = 20,
    stdDevMultiplier: number = 2,
    quantity: number = 10,
    name: string = 'BollingerBandsStrategy'
  ) {
    super(name);
    this.targetSymbol = targetSymbol;
    this.period = period;
    this.stdDevMultiplier = stdDevMultiplier;
    this.quantity = quantity;
  }

  async onInit(): Promise<void> {
    console.log(`[${this.name}] Initialized: Period=${this.period}, Multiplier=${this.stdDevMultiplier}, Target=${this.targetSymbol}`);
  }

  async onData(kline: KLine): Promise<void> {
    if (kline.symbol !== this.targetSymbol) return;

    this.history.push(kline.close);
    if (this.history.length > this.period) {
      this.history.shift();
    }

    if (this.history.length < this.period) return;

    const { middle, upper, lower } = this.calculateBands();

    if (kline.close <= lower && !this.hasPosition) {
      console.log(`[${this.name}] BUY SIGNAL: Price ${kline.close} <= Lower Band ${lower.toFixed(2)}`);
      await this.executeOrder('Buy', this.targetSymbol, kline.close);
    } else if (kline.close >= upper && this.hasPosition) {
      console.log(`[${this.name}] SELL SIGNAL: Price ${kline.close} >= Upper Band ${upper.toFixed(2)}`);
      await this.executeOrder('Sell', this.targetSymbol, kline.close);
    }
  }

  private calculateBands(): { middle: number; upper: number; lower: number } {
    const sum = this.history.reduce((a, b) => a + b, 0);
    const middle = sum / this.period;

    const variance = this.history.reduce((a, b) => a + Math.pow(b - middle, 2), 0) / this.period;
    const stdDev = Math.sqrt(variance);

    const upper = middle + this.stdDevMultiplier * stdDev;
    const lower = middle - this.stdDevMultiplier * stdDev;

    return { middle, upper, lower };
  }

  private async executeOrder(side: 'Buy' | 'Sell', symbol: string, price: number) {
    try {
      const orderId = await this.context.submitOrder({
        symbol,
        side,
        price,
        quantity: this.quantity,
      });
      console.log(`[${this.name}] ${side} order submitted: ${orderId} @ ${price}`);
      this.hasPosition = (side === 'Buy');
    } catch (error) {
      console.error(`[${this.name}] Failed to submit ${side} order:`, error);
    }
  }

  async onQuote(quote: Quote): Promise<void> {}

  async onOrderUpdate(order: Order): Promise<void> {
    if (order.status === 'Filled') {
      console.log(`[${this.name}] Order FILLED: ${order.side} ${order.quantity} @ ${order.price}`);
    }
  }

  async onStop(): Promise<void> {
    console.log(`[${this.name}] Stopped`);
  }
}
