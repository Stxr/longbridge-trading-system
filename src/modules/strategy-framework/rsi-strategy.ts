// description: RSI 强弱指标策略，通过相对强弱指数识别价格的超买与超卖状态。
import { BaseStrategy } from './base-strategy';
import { KLine, Quote, Order } from '../../shared/models/market-data';

export class RSIStrategy extends BaseStrategy {
  static params = [
    { name: "period", type: "number", default: 14, message: "RSI 周期" },
    { name: "buyThreshold", type: "number", default: 30, message: "买入超卖阈值" },
    { name: "sellThreshold", type: "number", default: 70, message: "卖出超买阈值" },
    { name: "quantity", type: "number", default: 100, message: "单笔交易数量" }
  ];
  private period: number;
  private buyThreshold: number;
  private sellThreshold: number;
  private quantity: number;
  private targetSymbol: string;
  private history: number[] = [];
  private hasPosition: boolean = false;

  constructor(configs: any[]) {
    super('RSIStrategy');
    const config = configs[0];
    this.targetSymbol = config.symbol;
    this.period = config.period || 14;
    this.buyThreshold = config.buyThreshold || 30;
    this.sellThreshold = config.sellThreshold || 70;
    this.quantity = config.quantity || 100;
  }

  async onInit(): Promise<void> { console.log(`[${this.name}] Initialized: Target=${this.targetSymbol}`); }

  async onData(kline: KLine): Promise<void> {
    const fullSymbol = `${kline.symbol}.${kline.market}`;
    if (kline.symbol !== this.targetSymbol && fullSymbol !== this.targetSymbol) return;

    this.history.push(kline.close);
    if (this.history.length > this.period + 1) this.history.shift();
    if (this.history.length <= this.period) return;

    const rsi = this.calculateRSI();
    if (rsi <= this.buyThreshold && !this.hasPosition) {
      console.log(`[${kline.timestamp}] RSI BUY: RSI ${rsi.toFixed(2)}`);
      await this.executeOrder('Buy', this.targetSymbol, kline.close);
    } else if (rsi >= this.sellThreshold && this.hasPosition) {
      console.log(`[${kline.timestamp}] RSI SELL: RSI ${rsi.toFixed(2)}`);
      await this.executeOrder('Sell', this.targetSymbol, kline.close);
    }
  }

  private calculateRSI(): number {
    let gains = 0, losses = 0;
    for (let i = 1; i < this.history.length; i++) {
      const diff = this.history[i] - this.history[i-1];
      if (diff >= 0) gains += diff; else losses -= diff;
    }
    const rs = (gains / this.period) / (losses / this.period || 1);
    return 100 - (100 / (1 + rs));
  }

  private async executeOrder(side: 'Buy' | 'Sell', symbol: string, price: number) {
    this.hasPosition = (side === 'Buy');
    await this.context.submitOrder({ symbol, side, price, quantity: this.quantity });
  }

  async onQuote(quote: Quote): Promise<void> {}
  async onOrderUpdate(order: Order): Promise<void> {}
  async onStop(): Promise<void> {}
}