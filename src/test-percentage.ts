import { BacktestEngine } from './modules/backtesting-engine';
import { PercentageStrategy } from './modules/strategy-framework/percentage-strategy';
import { KLine } from './shared/models/market-data';
import { initDatabase } from './modules/data-management/database';

async function runTest() {
  await initDatabase();

  const mockKLines: KLine[] = [];
  const symbol = '700.HK';
  const basePrice = 100;
  
  // Create a price sequence: 100 -> 94 (drop > 5%) -> 101 (rise > 5% from 94)
  const prices = [100, 99, 98, 97, 96, 95, 94, 95, 96, 97, 98, 99, 100, 101];

  for (let i = 0; i < prices.length; i++) {
    const price = prices[i];
    mockKLines.push({
      symbol: symbol,
      market: 'HK',
      timestamp: new Date(2024, 0, 1, 9, 30 + i).toISOString(),
      open: price,
      high: price + 0.5,
      low: price - 0.5,
      close: price,
      volume: 1000,
    });
  }

  // Parameters can now be passed here
  const threshold = 0.05;
  const quantity = 100;
  const strategy = new PercentageStrategy(symbol, basePrice, threshold, quantity);
  const engine = new BacktestEngine(strategy, mockKLines);
  
  console.log(`Starting Percentage Strategy backtest for ${symbol}...`);
  const { metrics } = await engine.run();
  
  console.log('\n--- Backtest Results ---');
  console.log(`Total Trades: ${metrics.totalTrades}`);
  console.log(`Total Return: ${(metrics.totalReturn * 100).toFixed(2)}%`);
  console.log(`Max Drawdown: ${(metrics.maxDrawdown * 100).toFixed(2)}%`);
}

runTest().catch(console.error);
