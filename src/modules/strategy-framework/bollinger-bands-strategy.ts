// description: 布林带策略，利用价格通道的收敛与扩张识别超买超卖和趋势反转。
import { BaseStrategy } from './base-strategy';
import { KLine, Quote, Order } from '../../shared/models/market-data';

export interface BollingerConfig {
  symbol: string;
  period?: number;
  stdDevMultiplier?: number;
  quantity?: number;
}

export class BollingerBandsStrategy extends BaseStrategy {
  static params = [
    { name: 'period', type: 'number', default: 20, message: '计算周期 (Period)' },
    { name: 'stdDevMultiplier', type: 'number', default: 2, message: '标准差倍数 (Multiplier)' },
    { name: 'quantity', type: 'number', default: 100, message: '单笔交易数量' }
  ];

  private period: number;
  private stdDevMultiplier: number;
  private quantity: number;
  private targetSymbol: string;
  private history: number[] = [];
  private hasPosition: boolean = false;

  constructor(configs: BollingerConfig[]) {
    super('BollingerBandsStrategy');
    const config = configs[0]; // For now focus on single asset
    this.targetSymbol = config.symbol;
    this.period = config.period || 20;
    this.stdDevMultiplier = config.stdDevMultiplier || 2;
    this.quantity = config.quantity || 100;
  }

  async onInit(): Promise<void> {
    console.log(`[${this.name}] Initialized: Target=${this.targetSymbol}, Period=${this.period}, Multiplier=${this.stdDevMultiplier}`);
  }

  async onData(kline: KLine): Promise<void> {
    // FIX: Robust symbol matching
    const fullSymbol = `${kline.symbol}.${kline.market}`;
    if (kline.symbol !== this.targetSymbol && fullSymbol !== this.targetSymbol) {
      return;
    }

    this.history.push(kline.close);
    if (this.history.length > this.period) {
      this.history.shift();
    }

    if (this.history.length < this.period) return;

    const { middle, upper, lower } = this.calculateBands();

    if (kline.close <= lower && !this.hasPosition) {
      console.log(`[${kline.timestamp}] BUY SIGNAL: Price ${kline.close} <= Lower Band ${lower.toFixed(2)}`);
      await this.executeOrder('Buy', this.targetSymbol, kline.close);
    } else if (kline.close >= upper && this.hasPosition) {
      console.log(`[${kline.timestamp}] SELL SIGNAL: Price ${kline.close} >= Upper Band ${upper.toFixed(2)}`);
      await this.executeOrder('Sell', this.targetSymbol, kline.close);
    }
  }

  private calculateBands(): { middle: number; upper: number; lower: number } {
    const sum = this.history.reduce((a, b) => a + b, 0);
    const middle = sum / this.period;
    const variance = this.history.reduce((a, b) => a + Math.pow(b - middle, 2), 0) / this.period;
    const stdDev = Math.sqrt(variance);
    return { 
      middle, 
      upper: middle + this.stdDevMultiplier * stdDev, 
      lower: middle - this.stdDevMultiplier * stdDev 
    };
  }

  private async executeOrder(side: 'Buy' | 'Sell', symbol: string, price: number) {
    try {
      this.hasPosition = (side === 'Buy');
      await this.context.submitOrder({ symbol, side, price, quantity: this.quantity });
    } catch (error) {
      console.error(`Failed to submit ${side} order:`, error);
    }
  }

  async onQuote(quote: Quote): Promise<void> {}
  async onOrderUpdate(order: Order): Promise<void> {
    if (order.status === 'Filled') {
      console.log(`[${this.name}][${order.symbol}] Order FILLED: ${order.side} ${order.quantity} @ ${order.price}`);
    }
  }
  async onStop(): Promise<void> {
    console.log(`[${this.name}] Stopped`);
  }
}