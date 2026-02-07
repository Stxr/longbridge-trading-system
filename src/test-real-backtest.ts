import { LongbridgeClient } from './modules/longbridge-integration/client';
import { QuoteProvider } from './modules/longbridge-integration/quote-provider';
import { BacktestEngine } from './modules/backtesting-engine';
import { HighLowReversionStrategy, HighLowConfig } from './modules/strategy-framework/high-low-reversion-strategy';
import { Period } from 'longport';
import dotenv from 'dotenv';

dotenv.config();

async function runRealBacktest() {
  const symbol = process.env.TARGET_SYMBOL || '700.HK'; // Default Tencent
  const period = Period.Day;
  const count = 365; // Backtest last 1 year

  console.log(`Starting real backtest for ${symbol} over last ${count} days...`);

  // 1. Initialize Client to fetch data
  const client = new LongbridgeClient();
  const quoteProvider = new QuoteProvider(client);
  
  try {
    await quoteProvider.init();
    
    // 2. Fetch Historical Data
    console.log('Fetching historical data...');
    const history = await quoteProvider.getHistoryCandlesticks(symbol, period, count);
    console.log(`Fetched ${history.length} candlesticks.`);

    if (history.length === 0) {
      console.error('No historical data found. Exiting.');
      process.exit(1);
    }

    // 3. Setup Strategy
    const config: HighLowConfig = {
      symbol,
      periodType: 'daily',
      buyThresholdPercent: 0.05, // 5% bounce from low
      sellThresholdPercent: 0.05, // 5% drop from high
      quantity: 100
    };
    const strategy = new HighLowReversionStrategy([config]);

    // 4. Run Backtest Engine
    const engine = new BacktestEngine(strategy, history, 1000000); // 1M initial cash
    const { metrics } = await engine.run();

    // 5. Report Results
    console.log('\n--- Backtest Results ---');
    console.log(`Symbol: ${symbol}`);
    console.log(`Period: ${new Date(history[0].timestamp).toLocaleDateString()} to ${new Date(history[history.length-1].timestamp).toLocaleDateString()}`);
    console.log(`Total Trades: ${metrics.totalTrades}`);
    console.log(`Win Rate: ${(metrics.winRate * 100).toFixed(2)}%`);
    console.log(`Total Return: ${(metrics.totalReturn * 100).toFixed(2)}%`);
    console.log(`Max Drawdown: ${(metrics.maxDrawdown * 100).toFixed(2)}%`);
    console.log(`Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}`);
    
  } catch (error) {
    console.error('Backtest failed:', error);
  } finally {
    process.exit(0);
  }
}

runRealBacktest();
