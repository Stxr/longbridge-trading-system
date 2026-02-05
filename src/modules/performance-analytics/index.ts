export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
}

export class PerformanceAnalyzer {
  static calculateMetrics(equityHistory: { timestamp: string; equity: number }[], trades: any[]): PerformanceMetrics {
    if (equityHistory.length < 2) {
      return { totalReturn: 0, annualizedReturn: 0, maxDrawdown: 0, sharpeRatio: 0, winRate: 0, totalTrades: 0 };
    }

    const initialEquity = equityHistory[0].equity;
    const finalEquity = equityHistory[equityHistory.length - 1].equity;
    const totalReturn = (finalEquity - initialEquity) / initialEquity;

    // Max Drawdown
    let maxDrawdown = 0;
    let peak = -Infinity;
    for (const entry of equityHistory) {
      if (entry.equity > peak) peak = entry.equity;
      const dd = (peak - entry.equity) / peak;
      if (dd > maxDrawdown) maxDrawdown = dd;
    }

    // Sharpe Ratio (simplified, assuming daily steps and 0 risk-free rate)
    const returns = [];
    for (let i = 1; i < equityHistory.length; i++) {
      returns.push((equityHistory[i].equity - equityHistory[i - 1].equity) / equityHistory[i - 1].equity);
    }
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(returns.map(x => Math.pow(x - avgReturn, 2)).reduce((a, b) => a + b, 0) / returns.length);
    const sharpeRatio = stdDev === 0 ? 0 : (avgReturn / stdDev) * Math.sqrt(252); // Annualized

    // Win Rate
    const filledTrades = trades.filter(t => t.status === 'Filled');
    const wins = 0; // Needs more complex trade pairing logic to calculate properly
    
    return {
      totalReturn,
      annualizedReturn: totalReturn, // Simplified
      maxDrawdown,
      sharpeRatio,
      winRate: 0,
      totalTrades: filledTrades.length,
    };
  }
}
