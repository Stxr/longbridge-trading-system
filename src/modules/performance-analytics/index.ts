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

    // Sharpe Ratio calculation
    const returns = [];
    for (let i = 1; i < equityHistory.length; i++) {
      returns.push((equityHistory[i].equity - equityHistory[i - 1].equity) / equityHistory[i - 1].equity);
    }
    
    const avgReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
    const stdDev = Math.sqrt(returns.map(x => Math.pow(x - avgReturn, 2)).reduce((a, b) => a + b, 0) / returns.length);
    
    // Calculate annualization factor based on the actual time span
    // We estimate how many such periods exist in a trading year (approx 252 days)
    let sharpeRatio = 0;
    if (stdDev !== 0 && equityHistory.length >= 2) {
      const firstTs = new Date(equityHistory[0].timestamp).getTime();
      const lastTs = new Date(equityHistory[equityHistory.length - 1].timestamp).getTime();
      const totalDays = (lastTs - firstTs) / (1000 * 60 * 60 * 24);
      
      // If the backtest spans less than a day, we treat it as a fraction of a day
      const daysPerYear = 252;
      const dataPointsPerDay = (equityHistory.length - 1) / (totalDays || 1);
      const annualizationFactor = Math.sqrt(dataPointsPerDay * daysPerYear);
      
      sharpeRatio = (avgReturn / stdDev) * annualizationFactor;
    }
    
    // Win Rate Calculation
    const filledTrades = trades.filter(t => t.status === 'Filled');
    let wins = 0;
    let closedTrades = 0;
    const buyStack: any[] = [];

    for (const trade of filledTrades) {
      if (trade.side === 'Buy') {
        buyStack.push(trade);
      } else if (trade.side === 'Sell' && buyStack.length > 0) {
        const buyOrder = buyStack.pop();
        const profit = (trade.price - buyOrder.price) * trade.quantity;
        if (profit > 0) wins++;
        closedTrades++;
      }
    }

    const winRate = closedTrades > 0 ? wins / closedTrades : 0;
    
    return {
      totalReturn,
      annualizedReturn: totalReturn, // Simplified
      maxDrawdown,
      sharpeRatio,
      winRate,
      totalTrades: filledTrades.length,
    };
  }
}
