import { BaseStrategy } from './base-strategy';
import { KLine, Quote, Order } from '../../shared/models/market-data';

export class PercentageStrategy extends BaseStrategy {
  private referencePrice: number | null = null;
  private hasPosition: boolean = false;
  private threshold: number;
  private quantity: number;
  private targetSymbol: string;
  private isProcessingOrder: boolean = false;

  constructor(
    targetSymbol: string,
    initialReferencePrice?: number,
    threshold: number = 0.05,
    quantity: number = 10,
    name: string = 'PercentageStrategy'
  ) {
    super(name);
    this.targetSymbol = targetSymbol;
    this.threshold = threshold;
    this.quantity = quantity;
    if (initialReferencePrice) {
      this.referencePrice = initialReferencePrice;
    }
  }

  async onInit(): Promise<void> {
    console.log(`[${this.name}] Initialized in ${this.context.mode} mode.`);
    console.log(`[${this.name}] Target: ${this.targetSymbol}, Reference Price: ${this.referencePrice ?? 'Waiting for first quote'}`);
  }

  async onData(kline: KLine): Promise<void> {
    if (kline.symbol !== this.targetSymbol) return;
    await this.checkSignal(kline.close, kline.symbol, kline.timestamp);
  }

  async onQuote(quote: Quote): Promise<void> {
    // Note: quote.symbol might be just 'AGQ' while targetSymbol is 'AGQ.US'
    // Our QuoteProvider splits symbol/market, so we check accordingly
    const fullSymbol = `${quote.symbol}.${quote.market}`;
    if (fullSymbol !== this.targetSymbol && quote.symbol !== this.targetSymbol) return;
    
    await this.checkSignal(quote.lastPrice, this.targetSymbol, quote.timestamp);
  }

  private async checkSignal(currentPrice: number, symbol: string, timestamp: string) {
    if (this.referencePrice === null) {
      this.referencePrice = currentPrice;
      console.log(`[${this.name}] Set initial reference price: ${this.referencePrice}`);
      return;
    }

    if (this.isProcessingOrder) return;
    this.isProcessingOrder = true;

    const priceChange = (currentPrice - this.referencePrice) / this.referencePrice;

    if (!this.hasPosition && priceChange <= -this.threshold) {
      console.log(`[${this.name}] BUY SIGNAL: Price dropped ${(priceChange * 100).toFixed(2)}% (Current: ${currentPrice}, Ref: ${this.referencePrice})`);
      await this.executeOrder('Buy', symbol, currentPrice);
    } else if (this.hasPosition && priceChange >= this.threshold) {
      console.log(`[${this.name}] SELL SIGNAL: Price rose ${(priceChange * 100).toFixed(2)}% (Current: ${currentPrice}, Ref: ${this.referencePrice})`);
      await this.executeOrder('Sell', symbol, currentPrice);
    }
    
    this.isProcessingOrder = false;
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
      this.referencePrice = price; 
    } catch (error) {
      console.error(`[${this.name}] Failed to submit ${side} order:`, error);
    }
  }

  async onOrderUpdate(order: Order): Promise<void> {
    if (order.status === 'Filled') {
        console.log(`[${this.name}] Order FILLED: ${order.side} ${order.quantity} @ ${order.price}`);
    }
  }

  async onStop(): Promise<void> {
    console.log(`[${this.name}] Strategy stopped`);
  }
}