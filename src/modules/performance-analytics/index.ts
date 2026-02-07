import dayjs from 'dayjs';

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  initialEquity: number;
  finalEquity: number;
  totalCommission: number;
}

export class PerformanceAnalyzer {
  static calculateMetrics(equityHistory: { timestamp: string; equity: number }[], trades: any[]): PerformanceMetrics {
    if (equityHistory.length < 2) {
      return { totalReturn: 0, annualizedReturn: 0, maxDrawdown: 0, sharpeRatio: 0, winRate: 0, totalTrades: 0, initialEquity: 0, finalEquity: 0, totalCommission: 0 };
    }

    const initialEquity = equityHistory[0].equity;
    const finalEquity = equityHistory[equityHistory.length - 1].equity;
    const totalReturn = initialEquity > 0 ? (finalEquity - initialEquity) / initialEquity : 0;

    // 1. Robust Max Drawdown
    let maxDrawdown = 0;
    let peak = initialEquity; 
    for (const entry of equityHistory) {
      if (entry.equity > peak) peak = entry.equity;
      if (peak > 0) {
        const dd = (peak - entry.equity) / peak;
        if (dd > maxDrawdown) maxDrawdown = dd;
      }
    }

    // 2. High-Frequency Robust Sharpe Ratio
    const dailyEquity: Map<string, number> = new Map();
    equityHistory.forEach(e => {
      const date = dayjs(e.timestamp).format('YYYY-MM-DD');
      dailyEquity.set(date, e.equity);
    });

    const dailyReturns: number[] = [];
    const dailyValues = Array.from(dailyEquity.values());
    for (let i = 1; i < dailyValues.length; i++) {
      if (dailyValues[i-1] > 0) {
        dailyReturns.push((dailyValues[i] - dailyValues[i-1]) / dailyValues[i-1]);
      }
    }

    let sharpeRatio = 0;
    if (dailyReturns.length > 1) {
      const avgDailyReturn = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
      const dailyVar = dailyReturns.reduce((a, b) => a + Math.pow(b - avgDailyReturn, 2), 0) / dailyReturns.length;
      const dailyStd = Math.sqrt(dailyVar);
      if (dailyStd > 0) {
        sharpeRatio = (avgDailyReturn / dailyStd) * Math.sqrt(252);
      }
    }
    
    // 3. Win Rate & Commission logic
    const filledTrades = trades.filter(t => t.status === 'Filled');
    const totalCommission = filledTrades.reduce((sum, t) => sum + (t.commission || 0), 0);
    
    let wins = 0;
    let closedTrades = 0;
    const buyStack: any[] = [];

    for (const trade of filledTrades) {
      if (trade.side === 'Buy') {
        buyStack.push(trade);
      } else if (trade.side === 'Sell' && buyStack.length > 0) {
        const buyOrder = buyStack.pop();
        const profit = (trade.price - buyOrder.price) * Math.min(trade.quantity, buyOrder.quantity);
        if (profit > 0) wins++;
        closedTrades++;
      }
    }

    return {
      totalReturn,
      annualizedReturn: totalReturn, 
      maxDrawdown: isNaN(maxDrawdown) ? 0 : maxDrawdown,
      sharpeRatio: isNaN(sharpeRatio) ? 0 : sharpeRatio,
      winRate: closedTrades > 0 ? wins / closedTrades : 0,
      totalTrades: filledTrades.length,
      initialEquity,
      finalEquity,
      totalCommission
    };
  }
}
