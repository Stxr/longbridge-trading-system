// description: MACD 指标策略，利用平滑异同移动平均线的金叉与死叉捕捉动能方向。
import { BaseStrategy } from './base-strategy';
import { KLine, Quote, Order } from '../../shared/models/market-data';

export class MACDStrategy extends BaseStrategy {
  private fastPeriod: number;
  private slowPeriod: number;
  private signalPeriod: number;
  private quantity: number;
  private targetSymbol: string;
  private history: number[] = [];
  private hasPosition: boolean = false;
  
  private lastFastEma: number | null = null;
  private lastSlowEma: number | null = null;
  private lastSignalLine: number | null = null;
  private lastMacdLine: number | null = null;

  constructor(
    targetSymbol: string,
    fastPeriod: number = 12,
    slowPeriod: number = 26,
    signalPeriod: number = 9,
    quantity: number = 10,
    name: string = 'MACDStrategy'
  ) {
    super(name);
    this.targetSymbol = targetSymbol;
    this.fastPeriod = fastPeriod;
    this.slowPeriod = slowPeriod;
    this.signalPeriod = signalPeriod;
    this.quantity = quantity;
  }

  async onInit(): Promise<void> {
    console.log(`[${this.name}] Initialized: Fast=${this.fastPeriod}, Slow=${this.slowPeriod}, Signal=${this.signalPeriod}, Target=${this.targetSymbol}`);
  }

  async onData(kline: KLine): Promise<void> {
    if (kline.symbol !== this.targetSymbol) return;

    this.updateIndicators(kline.close);

    if (this.lastMacdLine === null || this.lastSignalLine === null || this.lastFastEma === null || this.lastSlowEma === null) return;

    // We need at least one previous point for crossover check
    // In a real implementation, we'd store prevMacdLine and prevSignalLine
  }

  // Simplified indicator update for crossover check
  private updateIndicators(currentPrice: number) {
    // 1. Update EMAs
    this.lastFastEma = this.calculateEMA(currentPrice, this.lastFastEma, this.fastPeriod);
    this.lastSlowEma = this.calculateEMA(currentPrice, this.lastSlowEma, this.slowPeriod);

    const prevMacdLine = this.lastMacdLine;
    const prevSignalLine = this.lastSignalLine;

    // 2. MACD Line
    this.lastMacdLine = this.lastFastEma - this.lastSlowEma;

    // 3. Signal Line (EMA of MACD Line)
    this.lastSignalLine = this.calculateEMA(this.lastMacdLine, this.lastSignalLine, this.signalPeriod);

    if (prevMacdLine !== null && prevSignalLine !== null) {
        // Bullish Crossover
        if (prevMacdLine <= prevSignalLine && this.lastMacdLine > this.lastSignalLine && !this.hasPosition) {
            console.log(`[${this.name}] MACD BULLISH CROSSOVER: Buy Signal @ ${currentPrice}`);
            this.executeOrder('Buy', this.targetSymbol, currentPrice);
        }
        // Bearish Crossover
        else if (prevMacdLine >= prevSignalLine && this.lastMacdLine < this.lastSignalLine && this.hasPosition) {
            console.log(`[${this.name}] MACD BEARISH CROSSOVER: Sell Signal @ ${currentPrice}`);
            this.executeOrder('Sell', this.targetSymbol, currentPrice);
        }
    }
  }

  private calculateEMA(current: number, lastEma: number | null, period: number): number {
    if (lastEma === null) return current; // Initial value
    const k = 2 / (period + 1);
    return current * k + lastEma * (1 - k);
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
