// description: MACD 指标策略，利用平滑异同移动平均线的金叉与死叉捕捉动能方向。
import { BaseStrategy } from './base-strategy';
import { KLine, Quote, Order } from '../../shared/models/market-data';

export class MACDStrategy extends BaseStrategy {
  static params = [
    { name: 'fastPeriod', type: 'number', default: 12, message: '快线周期 (Fast EMA)' },
    { name: 'slowPeriod', type: 'number', default: 26, message: '慢线周期 (Slow EMA)' },
    { name: 'signalPeriod', type: 'number', default: 9, message: '信号线周期 (Signal)' },
    { name: 'quantity', type: 'number', default: 100, message: '单笔交易数量' }
  ];

  private fastPeriod: number;
  private slowPeriod: number;
  private signalPeriod: number;
  private quantity: number;
  private targetSymbol: string;
  
  private lastFastEma: number | null = null;
  private lastSlowEma: number | null = null;
  private lastSignalLine: number | null = null;
  private lastMacdLine: number | null = null;
  private hasPosition: boolean = false;

  constructor(configs: any[]) {
    super('MACDStrategy');
    const config = configs[0];
    this.targetSymbol = config.symbol;
    this.fastPeriod = config.fastPeriod || 12;
    this.slowPeriod = config.slowPeriod || 26;
    this.signalPeriod = config.signalPeriod || 9;
    this.quantity = config.quantity || 100;
  }

  async onInit(): Promise<void> {
    console.log(`[${this.name}] Initialized: Target=${this.targetSymbol}, Fast=${this.fastPeriod}, Slow=${this.slowPeriod}`);
  }

  async onData(kline: KLine): Promise<void> {
    const fullSymbol = `${kline.symbol}.${kline.market}`;
    if (kline.symbol !== this.targetSymbol && fullSymbol !== this.targetSymbol) return;

    this.updateIndicators(kline.close, kline.timestamp);
  }

  private updateIndicators(currentPrice: number, timestamp: string) {
    this.lastFastEma = this.calculateEMA(currentPrice, this.lastFastEma, this.fastPeriod);
    this.lastSlowEma = this.calculateEMA(currentPrice, this.lastSlowEma, this.slowPeriod);

    const prevMacdLine = this.lastMacdLine;
    const prevSignalLine = this.lastSignalLine;

    this.lastMacdLine = this.lastFastEma - this.lastSlowEma;
    this.lastSignalLine = this.calculateEMA(this.lastMacdLine, this.lastSignalLine, this.signalPeriod);

    if (prevMacdLine !== null && prevSignalLine !== null) {
        if (prevMacdLine <= prevSignalLine && this.lastMacdLine > this.lastSignalLine && !this.hasPosition) {
            console.log(`[${timestamp}] MACD BUY: Price ${currentPrice}`);
            this.executeOrder('Buy', this.targetSymbol, currentPrice);
        } else if (prevMacdLine >= prevSignalLine && this.lastMacdLine < this.lastSignalLine && this.hasPosition) {
            console.log(`[${timestamp}] MACD SELL: Price ${currentPrice}`);
            this.executeOrder('Sell', this.targetSymbol, currentPrice);
        }
    }
  }

  private calculateEMA(current: number, lastEma: number | null, period: number): number {
    if (lastEma === null) return current;
    const k = 2 / (period + 1);
    return current * k + lastEma * (1 - k);
  }

  private async executeOrder(side: 'Buy' | 'Sell', symbol: string, price: number) {
    try {
      this.hasPosition = (side === 'Buy');
      await this.context.submitOrder({ symbol, side, price, quantity: this.quantity });
    } catch (error) {
      console.error('Order failed:', error);
    }
  }

  async onQuote(quote: Quote): Promise<void> {}
  async onOrderUpdate(order: Order): Promise<void> {
    if (order.status === 'Filled') console.log(`[${this.name}] Order FILLED: ${order.side} @ ${order.price}`);
  }
  async onStop(): Promise<void> { console.log(`[${this.name}] Stopped`); }
}