import { BacktestFactory } from './modules/backtesting-engine/factory';
import { HighLowReversionStrategy, HighLowConfig } from './modules/strategy-framework/high-low-reversion-strategy';
import { initDatabase } from './modules/data-management/database';
import dotenv from 'dotenv';
import dayjs from 'dayjs';

dotenv.config();

async function runDbBacktest() {
  const symbol = '700';
  const market = 'HK';
  const fullSymbol = `${symbol}.${market}`;
  const period = '1'; // Period.Min_1.toString()
  
  await initDatabase();

  console.log(`Starting database-driven backtest for ${fullSymbol}...`);

  try {
    // 1. Setup Strategy
    const config: HighLowConfig = {
      symbol: fullSymbol,
      periodType: 'daily',
      buyThresholdPercent: 0.002, // 0.2% bounce (much easier than 0.5%)
      sellThresholdPercent: 0.002, // 0.2% drop
      quantity: 100
    };
    const strategy = new HighLowReversionStrategy([config]);

    // 2. Load from DB and Run
    const startTime = '2026-01-01T00:00:00.000Z'; // Use all available data
    const endTime = '2026-02-10T00:00:00.000Z';

    const engine = await BacktestFactory.createFromDatabase(
      strategy,
      symbol,
      market,
      period,
      startTime,
      endTime,
      1000000
    );

    const { metrics } = await engine.run();

    // 3. Report Results
    console.log('--- DB Backtest Results ---');
    console.log(`Symbol: ${fullSymbol}`);
    console.log(`Total Trades: ${metrics.totalTrades}`);
    console.log(`Win Rate: ${(metrics.winRate * 100).toFixed(2)}%`);
    console.log(`Total Return: ${(metrics.totalReturn * 100).toFixed(2)}%`);
    console.log(`Max Drawdown: ${(metrics.maxDrawdown * 100).toFixed(2)}%`);
    console.log(`Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}`);
    
  } catch (error: any) {
    console.error('Backtest failed:', error.message);
  } finally {
    process.exit(0);
  }
}

runDbBacktest();
