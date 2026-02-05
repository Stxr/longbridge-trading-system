import { BaseStrategy } from './base-strategy';
import { KLine, Quote, Order } from '../../shared/models/market-data';

export class SMACrossoverStrategy extends BaseStrategy {
  private shortPeriod: number;
  private longPeriod: number;
  private quantity: number;
  private targetSymbol: string;
  private history: number[] = [];
  private hasPosition: boolean = false;
  private lastShortSma: number | null = null;
  private lastLongSma: number | null = null;

  constructor(
    targetSymbol: string,
    shortPeriod: number = 20,
    longPeriod: number = 50,
    quantity: number = 10,
    name: string = 'SMACrossoverStrategy'
  ) {
    super(name);
    this.targetSymbol = targetSymbol;
    this.shortPeriod = shortPeriod;
    this.longPeriod = longPeriod;
    this.quantity = quantity;
  }

  async onInit(): Promise<void> {
    console.log(`[${this.name}] Initialized: Short=${this.shortPeriod}, Long=${this.longPeriod}, Target=${this.targetSymbol}`);
  }

  async onData(kline: KLine): Promise<void> {
    if (kline.symbol !== this.targetSymbol) return;

    this.history.push(kline.close);
    const maxPeriod = Math.max(this.shortPeriod, this.longPeriod);
    if (this.history.length > maxPeriod) {
      this.history.shift();
    }

    if (this.history.length < this.longPeriod) return;

    const shortSma = this.calculateSMA(this.shortPeriod);
    const longSma = this.calculateSMA(this.longPeriod);

    if (this.lastShortSma !== null && this.lastLongSma !== null) {
      // Golden Cross: Short crosses above Long
      if (this.lastShortSma <= this.lastLongSma && shortSma > longSma && !this.hasPosition) {
        console.log(`[${this.name}] GOLDEN CROSS: Buy Signal @ ${kline.close}`);
        await this.executeOrder('Buy', this.targetSymbol, kline.close);
      } 
      // Death Cross: Short crosses below Long
      else if (this.lastShortSma >= this.lastLongSma && shortSma < longSma && this.hasPosition) {
        console.log(`[${this.name}] DEATH CROSS: Sell Signal @ ${kline.close}`);
        await this.executeOrder('Sell', this.targetSymbol, kline.close);
      }
    }

    this.lastShortSma = shortSma;
    this.lastLongSma = longSma;
  }

  private calculateSMA(period: number): number {
    const data = this.history.slice(-period);
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / period;
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

  async onQuote(quote: Quote): Promise<void> {
    // Basic implementation primarily uses KLine data (onData)
  }

  async onOrderUpdate(order: Order): Promise<void> {
    if (order.status === 'Filled') {
      console.log(`[${this.name}] Order FILLED: ${order.side} ${order.quantity} @ ${order.price}`);
    }
  }

  async onStop(): Promise<void> {
    console.log(`[${this.name}] Stopped`);
  }
}
