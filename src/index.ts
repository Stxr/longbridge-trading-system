import { LongbridgeClient } from './modules/longbridge-integration/client';
import { QuoteProvider } from './modules/longbridge-integration/quote-provider';
import { TradeProvider } from './modules/longbridge-integration/trade-provider';
import { TradingModeManager, TradingMode } from './modules/trading-mode-manager';
import { PercentageStrategy } from './modules/strategy-framework/percentage-strategy';
import { BacktestEngine } from './modules/backtesting-engine';
import { initDatabase } from './modules/data-management/database';
import dotenv from 'dotenv';

dotenv.config();

async function start() {
  await initDatabase();

  const mode = (process.env.TRADING_MODE as TradingMode) || 'live';
  const targetSymbol = process.env.TARGET_SYMBOL || 'AGQ.US';
  const initialRefPrice = process.env.INITIAL_REF_PRICE ? Number(process.env.INITIAL_REF_PRICE) : 130;
  const threshold = process.env.STRATEGY_THRESHOLD ? Number(process.env.STRATEGY_THRESHOLD) : 0.05;
  const quantity = process.env.STRATEGY_QUANTITY ? Number(process.env.STRATEGY_QUANTITY) : 10;

  console.log(`Starting system in ${mode} mode for ${targetSymbol}...`);
  console.log(`Strategy: Threshold=${threshold}, Quantity=${quantity}`);

  const strategy = new PercentageStrategy(targetSymbol, initialRefPrice, threshold, quantity);

  if (mode === 'live') {
    const client = new LongbridgeClient();
    const quoteProvider = new QuoteProvider(client);
    const tradeProvider = new TradeProvider(client);
    
    await quoteProvider.init();
    await tradeProvider.init();

    const modeManager = new TradingModeManager('live', tradeProvider);
    strategy.setContext(modeManager.getStrategyContext());

    quoteProvider.setOnQuote((quote) => strategy.onQuote(quote));
    quoteProvider.setOnKLine((kline) => strategy.onData(kline));
    tradeProvider.setOnOrderUpdate((order) => strategy.onOrderUpdate(order));

    await quoteProvider.subscribe([targetSymbol]);
    await strategy.onInit();
    
    console.log(`Live trading system running for ${targetSymbol}. Press Ctrl+C to stop.`);
  } else {
    // Mock backtest for verification
    const mockKLines = [
        { symbol: 'AGQ.US', market: 'US' as const, timestamp: new Date().toISOString(), open: 130, high: 131, low: 123, close: 123, volume: 1000 }
    ];
    const engine = new BacktestEngine(strategy, mockKLines);
    const metrics = await engine.run();
    console.log('Backtest finished.');
  }
}

start().catch(console.error);