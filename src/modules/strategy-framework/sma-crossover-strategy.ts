// description: 简单移动平均线交叉策略，利用短期与长期均线的金叉/死叉确定进出场点。
import { BaseStrategy } from './base-strategy';
import { KLine, Quote, Order } from '../../shared/models/market-data';

export class SMACrossoverStrategy extends BaseStrategy {
  static params = [
    { name: "fastPeriod", type: "number", default: 5, message: "快线均线周期" },
    { name: "slowPeriod", type: "number", default: 20, message: "慢线均线周期" },
    { name: "quantity", type: "number", default: 100, message: "单笔交易数量" }
  ];
  private fastPeriod: number;
  private slowPeriod: number;
  private targetSymbol: string;
  private quantity: number;
  private history: number[] = [];
  private hasPosition: boolean = false;

  constructor(configs: any[]) {
    super('SMACrossoverStrategy');
    const config = configs[0];
    this.targetSymbol = config.symbol;
    this.fastPeriod = config.fastPeriod || 5;
    this.slowPeriod = config.slowPeriod || 20;
    this.quantity = config.quantity || 100;
  }

  async onInit(): Promise<void> { console.log(`[${this.name}] Initialized: Target=${this.targetSymbol}`); }

  async onData(kline: KLine): Promise<void> {
    const fullSymbol = `${kline.symbol}.${kline.market}`;
    if (kline.symbol !== this.targetSymbol && fullSymbol !== this.targetSymbol) return;

    this.history.push(kline.close);
    if (this.history.length > this.slowPeriod + 1) this.history.shift();
    if (this.history.length <= this.slowPeriod) return;

    const prevFast = this.calculateSMA(this.history.slice(-this.fastPeriod - 1, -1));
    const prevSlow = this.calculateSMA(this.history.slice(-this.slowPeriod - 1, -1));
    const currFast = this.calculateSMA(this.history.slice(-this.fastPeriod));
    const currSlow = this.calculateSMA(this.history.slice(-this.slowPeriod));

    if (prevFast <= prevSlow && currFast > currSlow && !this.hasPosition) {
      console.log(`[${kline.timestamp}] SMA BUY: Fast ${currFast.toFixed(2)} > Slow ${currSlow.toFixed(2)}`);
      await this.executeOrder('Buy', this.targetSymbol, kline.close);
    } else if (prevFast >= prevSlow && currFast < currSlow && this.hasPosition) {
      console.log(`[${kline.timestamp}] SMA SELL: Fast ${currFast.toFixed(2)} < Slow ${currSlow.toFixed(2)}`);
      await this.executeOrder('Sell', this.targetSymbol, kline.close);
    }
  }

  private calculateSMA(data: number[]): number {
    return data.reduce((a, b) => a + b, 0) / data.length;
  }

  private async executeOrder(side: 'Buy' | 'Sell', symbol: string, price: number) {
    this.hasPosition = (side === 'Buy');
    await this.context.submitOrder({ symbol, side, price, quantity: this.quantity });
  }

  async onQuote(quote: Quote): Promise<void> {}
  async onOrderUpdate(order: Order): Promise<void> {}
  async onStop(): Promise<void> {}
}