import { LongbridgeClient } from '../longbridge-integration/client';
import { QuoteProvider } from '../longbridge-integration/quote-provider';
import { TradeProvider as LiveTradeProvider } from '../longbridge-integration/trade-provider';
import { BaseStrategy, StrategyContext } from '../strategy-framework/base-strategy';
import { Period } from 'longport';

export type TradingMode = 'backtest' | 'live';

export interface ITradeProvider {
  submitOrder(options: {
    symbol: string;
    side: 'Buy' | 'Sell';
    price?: number;
    quantity: number;
  }): Promise<string>;
  cancelOrder(orderId: string): Promise<void>;
}

export class TradingModeManager {
  private mode: TradingMode;
  private liveTradeProvider?: LiveTradeProvider;
  private backtestTradeProvider?: ITradeProvider;
  private quoteProvider?: QuoteProvider;

  constructor(
    mode: TradingMode, 
    liveTradeProvider?: LiveTradeProvider, 
    backtestTradeProvider?: ITradeProvider,
    quoteProvider?: QuoteProvider
  ) {
    this.mode = mode;
    this.liveTradeProvider = liveTradeProvider;
    this.backtestTradeProvider = backtestTradeProvider;
    this.quoteProvider = quoteProvider;
  }

  getMode(): TradingMode {
    return this.mode;
  }

  getStrategyContext(): StrategyContext {
    return {
      mode: this.mode,
      submitOrder: async (options) => {
        if (this.mode === 'live') {
          if (!this.liveTradeProvider) throw new Error('Live trade provider not initialized');
          return this.liveTradeProvider.submitOrder(options);
        } else {
          if (!this.backtestTradeProvider) throw new Error('Backtest trade provider not initialized');
          return this.backtestTradeProvider.submitOrder(options);
        }
      },
      cancelOrder: async (orderId) => {
        if (this.mode === 'live') {
          if (!this.liveTradeProvider) throw new Error('Live trade provider not initialized');
          return this.liveTradeProvider.cancelOrder(orderId);
        } else {
          if (!this.backtestTradeProvider) throw new Error('Backtest trade provider not initialized');
          return this.backtestTradeProvider.cancelOrder(orderId);
        }
      },
      getHistoryCandlesticks: this.mode === 'live' && this.quoteProvider 
        ? (symbol, period, count) => this.quoteProvider!.getHistoryCandlesticks(symbol, period, count)
        : undefined,
    };
  }
}
