import { LongbridgeClient } from './modules/longbridge-integration/client';
import { QuoteProvider } from './modules/longbridge-integration/quote-provider';
import { TradeProvider } from './modules/longbridge-integration/trade-provider';
import { TradingModeManager, TradingMode } from './modules/trading-mode-manager';
import { HelloWorldStrategy } from './modules/strategy-framework/hello-world-strategy';
import { BacktestEngine } from './modules/backtesting-engine';
import { initDatabase } from './modules/data-management/database';
import dotenv from 'dotenv';

dotenv.config();

async function start() {
  await initDatabase();

  const mode = (process.env.TRADING_MODE as TradingMode) || 'backtest';
  console.log(`Starting system in ${mode} mode...`);

  const strategy = new HelloWorldStrategy();

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

    await quoteProvider.subscribe(['700.HK', 'AGQ.US']);

    await strategy.onInit();
    console.log('Live trading system running. Subscribed to 700.HK, AAPL.US. Press Ctrl+C to stop.');
  } else {
    // For backtest mode in entry point, we'd typically load data from DB
    // For this dry-run, we'll use a small set of mock data
    const mockKLines = [
        { symbol: '700.HK', market: 'HK' as const, timestamp: new Date().toISOString(), open: 300, high: 305, low: 295, close: 302, volume: 1000 }
    ];
    const engine = new BacktestEngine(strategy, mockKLines);
    const metrics = await engine.run();
    console.log('Backtest finished.');
    console.log('Total Return:', (metrics.totalReturn * 100).toFixed(2), '%');
  }
}

start().catch(console.error);
