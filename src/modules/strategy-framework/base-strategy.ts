import { KLine, Quote, Order } from '../../shared/models/market-data';

export interface StrategyContext {
  mode: 'backtest' | 'live';
  submitOrder: (options: {
    symbol: string;
    side: 'Buy' | 'Sell';
    price?: number;
    quantity: number;
  }) => Promise<string>;
  cancelOrder: (orderId: string) => Promise<void>;
}

export abstract class BaseStrategy {
  public name: string;
  protected context!: StrategyContext;

  constructor(name: string) {
    this.name = name;
  }

  setContext(context: StrategyContext) {
    this.context = context;
  }

  abstract onInit(): Promise<void>;
  abstract onData(kline: KLine): Promise<void>;
  abstract onQuote(quote: Quote): Promise<void>;
  abstract onOrderUpdate(order: Order): Promise<void>;
  abstract onStop(): Promise<void>;
}
