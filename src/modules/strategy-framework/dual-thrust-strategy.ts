import { BaseStrategy } from './base-strategy';
import { KLine, Quote, Order } from '../../shared/models/market-data';

export class DualThrustStrategy extends BaseStrategy {
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

  constructor(
    targetSymbol: string,
    period: number = 2,
    k1: number = 0.5,
    k2: number = 0.5,
    quantity: number = 10,
    name: string = 'DualThrustStrategy'
  ) {
    super(name);
    this.targetSymbol = targetSymbol;
    this.period = period;
    this.k1 = k1;
    this.k2 = k2;
    this.quantity = quantity;
  }

  async onInit(): Promise<void> {
    console.log(`[${this.name}] Initialized: Period=${this.period}, K1=${this.k1}, K2=${this.k2}, Target=${this.targetSymbol}`);
  }

  async onData(kline: KLine): Promise<void> {
    if (kline.symbol !== this.targetSymbol) return;

    const dateStr = kline.timestamp.split('T')[0];
    
    // New Day detected
    if (this.currentDay !== dateStr) {
        if (this.currentDay !== null) {
            // Store previous day's summary
            // For simplicity in this demo, we use the last kline of the day as close
            // In a real system, you'd aggregate OHLC for the whole day.
            // Here we assume kline already represents a significant period.
        }
        this.currentDay = dateStr;
        this.dayOpen = kline.open;
        this.calculateTriggers();
    }

    if (this.buyTrigger === null || this.sellTrigger === null) return;

    if (kline.close >= this.buyTrigger && !this.hasPosition) {
        console.log(`[${this.name}] DUAL THRUST BUY: Price ${kline.close} >= Trigger ${this.buyTrigger.toFixed(2)}`);
        await this.executeOrder('Buy', this.targetSymbol, kline.close);
    } else if (kline.close <= this.sellTrigger && this.hasPosition) {
        console.log(`[${this.name}] DUAL THRUST SELL: Price ${kline.close} <= Trigger ${this.sellTrigger.toFixed(2)}`);
        await this.executeOrder('Sell', this.targetSymbol, kline.close);
    }

    // Update daily history (simplified for logic demo)
    // Real implementation would track daily OHLC.
  }

  private calculateTriggers() {
    // Requires historical daily data. 
    // In this simplified version, if we don't have enough history, we use default range.
    const HH = this.dailyHistory.length > 0 ? Math.max(...this.dailyHistory.slice(-this.period).map(d => d.high)) : this.dayOpen! * 1.02;
    const LC = this.dailyHistory.length > 0 ? Math.min(...this.dailyHistory.slice(-this.period).map(d => d.close)) : this.dayOpen! * 0.98;
    const HC = this.dailyHistory.length > 0 ? Math.max(...this.dailyHistory.slice(-this.period).map(d => d.close)) : this.dayOpen! * 1.01;
    const LL = this.dailyHistory.length > 0 ? Math.min(...this.dailyHistory.slice(-this.period).map(d => d.low)) : this.dayOpen! * 0.99;

    const range = Math.max(HH - LC, HC - LL);
    
    this.buyTrigger = this.dayOpen! + this.k1 * range;
    this.sellTrigger = this.dayOpen! - this.k2 * range;
    
    console.log(`[${this.name}] New Day ${this.currentDay}: Open=${this.dayOpen}, Range=${range.toFixed(2)}, BuyTrigger=${this.buyTrigger.toFixed(2)}, SellTrigger=${this.sellTrigger.toFixed(2)}`);
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
