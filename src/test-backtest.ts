import { BacktestEngine } from './modules/backtesting-engine';
import { HelloWorldStrategy } from './modules/strategy-framework/hello-world-strategy';
import { KLine } from './shared/models/market-data';
import { initDatabase } from './modules/data-management/database';

async function runTest() {
  await initDatabase();

  const mockKLines: KLine[] = [];
  const basePrice = 300;
  for (let i = 0; i < 20; i++) {
    const price = basePrice + Math.sin(i / 5) * 20;
    mockKLines.push({
      symbol: '700.HK',
      market: 'HK',
      timestamp: new Date(2024, 0, 1, 9, 30 + i).toISOString(),
      open: price,
      high: price + 2,
      low: price - 2,
      close: price + 1,
      volume: 1000,
    });
  }

  const strategy = new HelloWorldStrategy();
  const engine = new BacktestEngine(strategy, mockKLines);
  
  console.log('Starting backtest...');
  const metrics = await engine.run();
  
  console.log('\n--- Backtest Results ---');
  console.log(`Total Trades: ${metrics.totalTrades}`);
  console.log(`Total Return: ${(metrics.totalReturn * 100).toFixed(2)}%`);
  console.log(`Max Drawdown: ${(metrics.maxDrawdown * 100).toFixed(2)}%`);
  console.log(`Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}`);
}

runTest()
