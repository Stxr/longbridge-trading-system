import { LongbridgeClient } from '../longbridge-integration/client';
import { QuoteProvider } from '../longbridge-integration/quote-provider';
import { TradeProvider as LiveTradeProvider } from '../longbridge-integration/trade-provider';
import { BaseStrategy, StrategyContext } from '../strategy-framework/base-strategy';

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

  constructor(mode: TradingMode, liveTradeProvider?: LiveTradeProvider, backtestTradeProvider?: ITradeProvider) {
    this.mode = mode;
    this.liveTradeProvider = liveTradeProvider;
    this.backtestTradeProvider = backtestTradeProvider;
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
    };
  }
}
