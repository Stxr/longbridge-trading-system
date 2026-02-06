// description: 高低点回归策略，追踪价格极值并在显著回调时寻找反转机会。
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { BaseStrategy } from './base-strategy';
import { KLine, Quote, Order } from '../../shared/models/market-data';
import { Period } from 'longport';

dayjs.extend(utc);
dayjs.extend(timezone);

export type PeriodType = 'daily' | 'weekly' | 'monthly';

export interface HighLowConfig {
  symbol: string;
  periodType: PeriodType;
  buyThresholdPercent: number;
  sellThresholdPercent: number;
  quantity: number;
}

class PriceExtremeTracker {
  public currentHigh: number | null = null;
  public currentLow: number | null = null;
  public periodStart: string | null = null;
  public isLocked: boolean = false;

  constructor(public symbol: string, public periodType: PeriodType) {}

  public update(price: number, timestamp: string): boolean {
    if (this.isLocked) return false;

    let updated = false;
    if (this.currentHigh === null || price > this.currentHigh) {
      this.currentHigh = price;
      updated = true;
    }
    if (this.currentLow === null || price < this.currentLow) {
      this.currentLow = price;
      updated = true;
    }
    return updated;
  }

  public reset(firstPrice: number, timestamp: string) {
    this.currentHigh = firstPrice;
    this.currentLow = firstPrice;
    this.periodStart = timestamp;
    this.isLocked = false;
  }

  public shouldReset(timestamp: string): boolean {
    if (!this.periodStart) return true;
    const current = new Date(timestamp);
    const last = new Date(this.periodStart);

    switch (this.periodType) {
      case 'daily':
        return current.getUTCDate() !== last.getUTCDate() || 
               current.getUTCMonth() !== last.getUTCMonth() || 
               current.getUTCFullYear() !== last.getUTCFullYear();
      case 'weekly':
        const diffDays = (current.getTime() - last.getTime()) / (1000 * 60 * 60 * 24);
        return diffDays >= 7 || current.getUTCDay() < last.getUTCDay();
      case 'monthly':
        return current.getUTCMonth() !== last.getUTCMonth() || 
               current.getUTCFullYear() !== last.getUTCFullYear();
    }
  }
}

class AssetMonitor {
  public tracker: PriceExtremeTracker;
  public lastPrices: number[] = [];
  public hasPosition: boolean = false;
  public lastSignalType: 'Buy' | 'Sell' | null = null;

  constructor(public config: HighLowConfig) {
    this.tracker = new PriceExtremeTracker(config.symbol, config.periodType);
  }

  public addPrice(price: number) {
    this.lastPrices.push(price);
    if (this.lastPrices.length > 5) this.lastPrices.shift();
  }

  public getPriceAction(): 'Up' | 'Down' | 'Flat' {
    if (this.lastPrices.length < 3) return 'Flat';
    const last = this.lastPrices[this.lastPrices.length - 1];
    const prev = this.lastPrices[this.lastPrices.length - 2];
    const prevPrev = this.lastPrices[this.lastPrices.length - 3];
    if (last > prev && prev >= prevPrev) return 'Up';
    if (last < prev && prev <= prevPrev) return 'Down';
    return 'Flat';
  }
}

export class HighLowReversionStrategy extends BaseStrategy {
  private monitors: Map<string, AssetMonitor> = new Map();

  constructor(configs: HighLowConfig[], name: string = 'HighLowReversionStrategy') {
    super(name);
    for (const config of configs) {
      this.monitors.set(config.symbol, new AssetMonitor(config));
    }
  }

  async onInit(): Promise<void> {
    console.log(`[${this.name}] Initialized with ${this.monitors.size} assets.`);
  }

  async onData(kline: KLine): Promise<void> {
    // FIX: Match both full symbol (700.HK) and base symbol (700)
    const fullSymbol = `${kline.symbol}.${kline.market}`;
    const monitor = this.monitors.get(fullSymbol) || this.monitors.get(kline.symbol);
    
    if (!monitor) return;

    if (monitor.tracker.shouldReset(kline.timestamp)) {
      monitor.tracker.reset(kline.open, kline.timestamp);
      monitor.lastSignalType = null;
    }

    monitor.tracker.update(kline.high, kline.timestamp);
    monitor.tracker.update(kline.low, kline.timestamp);
    monitor.addPrice(kline.close);

    await this.checkSignal(monitor, kline.close, kline.timestamp);
  }

  private async checkSignal(monitor: AssetMonitor, currentPrice: number, timestamp: string) {
    const tracker = monitor.tracker;
    if (tracker.currentHigh === null || tracker.currentLow === null) return;

    const buyThreshold = tracker.currentLow * (1 + monitor.config.buyThresholdPercent);
    const sellThreshold = tracker.currentHigh * (1 - monitor.config.sellThresholdPercent);
    const slippage = 0.5;

    if (!monitor.hasPosition && monitor.lastSignalType !== 'Buy' && Math.abs(currentPrice - buyThreshold) <= slippage) {
      console.log(`[${timestamp}] BUY SIGNAL for ${monitor.config.symbol} @ ${currentPrice}`);
      await this.executeOrder(monitor, 'Buy', currentPrice);
      monitor.lastSignalType = 'Buy';
    } 
    else if (monitor.hasPosition && monitor.lastSignalType !== 'Sell' && Math.abs(currentPrice - sellThreshold) <= slippage) {
      console.log(`[${timestamp}] SELL SIGNAL for ${monitor.config.symbol} @ ${currentPrice}`);
      await this.executeOrder(monitor, 'Sell', currentPrice);
      monitor.lastSignalType = 'Sell';
    }
  }

  private async executeOrder(monitor: AssetMonitor, side: 'Buy' | 'Sell', price: number) {
    try {
      monitor.hasPosition = (side === 'Buy');
      await this.context.submitOrder({
        symbol: monitor.config.symbol,
        side,
        price,
        quantity: monitor.config.quantity,
      });
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
    console.log(`[${this.name}] Stopped.`);
  }
}