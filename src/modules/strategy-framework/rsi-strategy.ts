import { BaseStrategy } from './base-strategy';
import { KLine, Quote, Order } from '../../shared/models/market-data';

export class RSIStrategy extends BaseStrategy {
  private period: number;
  private overbought: number;
  private oversold: number;
  private quantity: number;
  private targetSymbol: string;
  private history: number[] = [];
  private hasPosition: boolean = false;
  private lastAvgGain: number | null = null;
  private lastAvgLoss: number | null = null;

  constructor(
    targetSymbol: string,
    period: number = 14,
    overbought: number = 70,
    oversold: number = 30,
    quantity: number = 10,
    name: string = 'RSIStrategy'
  ) {
    super(name);
    this.targetSymbol = targetSymbol;
    this.period = period;
    this.overbought = overbought;
    this.oversold = oversold;
    this.quantity = quantity;
  }

  async onInit(): Promise<void> {
    console.log(`[${this.name}] Initialized: Period=${this.period}, OB=${this.overbought}, OS=${this.oversold}, Target=${this.targetSymbol}`);
  }

  async onData(kline: KLine): Promise<void> {
    if (kline.symbol !== this.targetSymbol) return;

    this.history.push(kline.close);
    // RSI calculation typically needs at least period + 1 points
    if (this.history.length < this.period + 1) return;

    const rsi = this.calculateRSI();
    if (rsi === null) return;

    if (rsi <= this.oversold && !this.hasPosition) {
      console.log(`[${this.name}] BUY SIGNAL: RSI ${rsi.toFixed(2)} <= Oversold ${this.oversold}`);
      await this.executeOrder('Buy', this.targetSymbol, kline.close);
    } else if (rsi >= this.overbought && this.hasPosition) {
      console.log(`[${this.name}] SELL SIGNAL: RSI ${rsi.toFixed(2)} >= Overbought ${this.overbought}`);
      await this.executeOrder('Sell', this.targetSymbol, kline.close);
    }

    // Optional: limit history size if needed, but Wilder's RSI benefits from more history
    if (this.history.length > 200) {
        this.history.shift();
    }
  }

  private calculateRSI(): number | null {
    // Wilder's RSI implementation
    if (this.lastAvgGain === null || this.lastAvgLoss === null) {
      // First calculation (SMA based)
      let gains = 0;
      let losses = 0;

      for (let i = 1; i <= this.period; i++) {
        const diff = this.history[i] - this.history[i - 1];
        if (diff >= 0) gains += diff;
        else losses -= diff;
      }

      this.lastAvgGain = gains / this.period;
      this.lastAvgLoss = losses / this.period;
    } else {
      // Subsequent calculations (EMA based / Wilder's smoothing)
      const diff = this.history[this.history.length - 1] - this.history[this.history.length - 2];
      const currentGain = diff >= 0 ? diff : 0;
      const currentLoss = diff < 0 ? -diff : 0;

      this.lastAvgGain = (this.lastAvgGain * (this.period - 1) + currentGain) / this.period;
      this.lastAvgLoss = (this.lastAvgLoss * (this.period - 1) + currentLoss) / this.period;
    }

    if (this.lastAvgLoss === 0) return 100;
    const rs = this.lastAvgGain / this.lastAvgLoss;
    return 100 - (100 / (1 + rs));
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
