import { BacktestEngine } from './modules/backtesting-engine';
import { SMACrossoverStrategy } from './modules/strategy-framework/sma-crossover-strategy';
import { BollingerBandsStrategy } from './modules/strategy-framework/bollinger-bands-strategy';
import { RSIStrategy } from './modules/strategy-framework/rsi-strategy';
import { MACDStrategy } from './modules/strategy-framework/macd-strategy';
import { DualThrustStrategy } from './modules/strategy-framework/dual-thrust-strategy';
import { KLine } from './shared/models/market-data';
import { initDatabase } from './modules/data-management/database';

async function runTests() {
  await initDatabase();

  const symbol = '700.HK';
  const mockKLines: KLine[] = [];
  const basePrice = 300;
  
  // Generate 100 data points to give indicators enough history
  for (let i = 0; i < 100; i++) {
    const price = basePrice + Math.sin(i / 10) * 50; // Oscillating price
    mockKLines.push({
      symbol,
      market: 'HK',
      timestamp: new Date(2024, 0, 1, 9, 30 + i).toISOString(),
      open: price,
      high: price + 2,
      low: price - 2,
      close: price + 1,
      volume: 1000,
    });
  }

  const strategies = [
    new SMACrossoverStrategy(symbol, 5, 20),
    new BollingerBandsStrategy(symbol, 20, 2),
    new RSIStrategy(symbol, 14, 70, 30),
    new MACDStrategy(symbol, 12, 26, 9),
    new DualThrustStrategy(symbol, 2, 0.5, 0.5)
  ];

  for (const strategy of strategies) {
    console.log(`
=== Testing Strategy: ${strategy.name} ===`);
    const engine = new BacktestEngine(strategy, mockKLines);
    const metrics = await engine.run();
    
    console.log(`Results for ${strategy.name}:`);
    console.log(`Total Trades: ${metrics.totalTrades}`);
    console.log(`Total Return: ${(metrics.totalReturn * 100).toFixed(2)}%`);
    console.log(`Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}`);
    console.log(`Max Drawdown: ${(metrics.maxDrawdown * 100).toFixed(2)}%`);
  }
}

runTests().catch(console.error);
