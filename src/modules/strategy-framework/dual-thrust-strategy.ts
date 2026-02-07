// description: Dual Thrust 区间突破策略，基于前 N 日价格区间设定的上下轨进行突破交易。
import { BaseStrategy } from './base-strategy';
import { KLine, Quote, Order } from '../../shared/models/market-data';

export interface DualThrustConfig {
  symbol: string;
  period?: number;
  k1?: number;
  k2?: number;
  quantity?: number;
}

export class DualThrustStrategy extends BaseStrategy {
  static params = [
    { name: "period", type: "number", default: 2, message: "计算范围天数 (Period)" },
    { name: "k1", type: "number", default: 0.5, message: "上轨系数 (K1)" },
    { name: "k2", type: "number", default: 0.5, message: "下轨系数 (K2)" },
    { name: "quantity", type: "number", default: 100, message: "单笔交易数量" }
  ];
  private period: number;
  private k1: number;
  private k2: number;
  private quantity: number;
  private targetSymbol: string;
  
  private dailyHistory: { high: number, low: number, close: number }[] = [];
  private dayOpen: number | null = null;
  private buyTrigger: number | null = null;
  private sellTrigger: number | null = null;
  private hasPosition: boolean = false;
  private currentDay: string | null = null;

  constructor(configs: DualThrustConfig[]) {
    super('DualThrustStrategy');
    const config = configs[0];
    this.targetSymbol = config.symbol;
    this.period = config.period || 2;
    this.k1 = config.k1 || 0.5;
    this.k2 = config.k2 || 0.5;
    this.quantity = config.quantity || 100;
  }

  async onInit(): Promise<void> {
    console.log(`[${this.name}] Initialized: Target=${this.targetSymbol}, Period=${this.period}, K1=${this.k1}, K2=${this.k2}`);
  }

  async onData(kline: KLine): Promise<void> {
    const fullSymbol = `${kline.symbol}.${kline.market}`;
    if (kline.symbol !== this.targetSymbol && fullSymbol !== this.targetSymbol) {
      return;
    }

    const dateStr = kline.timestamp.split('T')[0];
    
    // New Day detected
    if (this.currentDay !== dateStr) {
        this.currentDay = dateStr;
        this.dayOpen = kline.open;
        this.calculateTriggers();
    }

    if (this.buyTrigger === null || this.sellTrigger === null) return;

    if (kline.close >= this.buyTrigger && !this.hasPosition) {
        console.log(`[${kline.timestamp}] DUAL THRUST BUY: Price ${kline.close} >= Trigger ${this.buyTrigger.toFixed(2)}`);
        await this.executeOrder('Buy', this.targetSymbol, kline.close);
    } else if (kline.close <= this.sellTrigger && this.hasPosition) {
        console.log(`[${kline.timestamp}] DUAL THRUST SELL: Price ${kline.close} <= Trigger ${this.sellTrigger.toFixed(2)}`);
        await this.executeOrder('Sell', this.targetSymbol, kline.close);
    }
  }

  private calculateTriggers() {
    const HH = this.dailyHistory.length > 0 ? Math.max(...this.dailyHistory.slice(-this.period).map(d => d.high)) : this.dayOpen! * 1.02;
    const LC = this.dailyHistory.length > 0 ? Math.min(...this.dailyHistory.slice(-this.period).map(d => d.close)) : this.dayOpen! * 0.98;
    const HC = this.dailyHistory.length > 0 ? Math.max(...this.dailyHistory.slice(-this.period).map(d => d.close)) : this.dayOpen! * 1.01;
    const LL = this.dailyHistory.length > 0 ? Math.min(...this.dailyHistory.slice(-this.period).map(d => d.low)) : this.dayOpen! * 0.99;

    const range = Math.max(HH - LC, HC - LL);
    this.buyTrigger = this.dayOpen! + this.k1 * range;
    this.sellTrigger = this.dayOpen! - this.k2 * range;
    
    console.log(`[${this.name}] New Day ${this.currentDay}: Open=${this.dayOpen}, BuyTrigger=${this.buyTrigger.toFixed(2)}, SellTrigger=${this.sellTrigger.toFixed(2)}`);
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