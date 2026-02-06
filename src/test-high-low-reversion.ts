import { BacktestEngine } from './modules/backtesting-engine';
import { HighLowReversionStrategy, HighLowConfig } from './modules/strategy-framework/high-low-reversion-strategy';
import { KLine } from './shared/models/market-data';
import { initDatabase } from './modules/data-management/database';

async function runTest() {
  await initDatabase();

  const configs: HighLowConfig[] = [
    {
      symbol: '700.HK',
      periodType: 'daily',
      buyThresholdPercent: 0.2, // Buy when price is at 20% of range (near bottom)
      sellThresholdPercent: 0.8, // Sell when price is at 80% of range (near top)
      quantity: 10
    }
  ];

  const mockKLines: KLine[] = [];
  
  // Day 1: Establish a range
  // High: 350, Low: 300. Range = 50. 
  // Buy threshold = 300 + 0.2*50 = 310
  // Sell threshold = 300 + 0.8*50 = 340
  
  const baseDate = new Date(2024, 0, 1, 9, 30);
  
  const prices = [
      320, 330, 350, 345, 330, 310, 305, 300, 302, 305, 308, // Hits low and starts recovery
      315, 325, 340, 345, 342, 338, // Hits high and starts pullback
      330, 320, 310, 305, 304, 303, 302, 301 // More points same day
  ];

  prices.forEach((p, i) => {
    mockKLines.push({
      symbol: '700.HK',
      market: 'HK',
      timestamp: new Date(baseDate.getTime() + i * 60000).toISOString(),
      open: p,
      high: p + 1,
      low: p - 1,
      close: p,
      volume: 1000,
    });
  });

  // Day 2: Test Reset
  const day2Date = new Date(2024, 0, 2, 9, 30);
  const day2Prices = [320, 325, 330];
  day2Prices.forEach((p, i) => {
    mockKLines.push({
      symbol: '700.HK',
      market: 'HK',
      timestamp: new Date(day2Date.getTime() + i * 60000).toISOString(),
      open: p,
      high: p + 1,
      low: p - 1,
      close: p,
      volume: 1000,
    });
  });

  const strategy = new HighLowReversionStrategy(configs);
  const engine = new BacktestEngine(strategy, mockKLines);
  
  console.log('Starting High-Low Reversion backtest...');
  const metrics = await engine.run();
  
  console.log('\n--- Backtest Results ---');
  console.log(`Total Trades: ${metrics.totalTrades}`);
  console.log(`Total Return: ${(metrics.totalReturn * 100).toFixed(2)}%`);
}

runTest().catch(console.error);
