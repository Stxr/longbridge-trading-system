import { DataReplayer } from './data-replayer';
import { OrderSimulator } from './order-simulator';
import { PortfolioTracker } from '../portfolio-tracking';
import { PerformanceAnalyzer, PerformanceMetrics } from '../performance-analytics';
import { BaseStrategy } from '../strategy-framework/base-strategy';
import { TradingModeManager } from '../trading-mode-manager';
import { KLine } from '../../shared/models/market-data';

export class BacktestEngine {
  private strategy: BaseStrategy;
  private replayer: DataReplayer;
  private simulator: OrderSimulator;
  private tracker: PortfolioTracker;
  private equityHistory: { timestamp: string; equity: number }[] = [];
  private allOrders: any[] = [];

  constructor(strategy: BaseStrategy, klines: KLine[], initialCash: number = 1000000) {
    this.strategy = strategy;
    this.replayer = new DataReplayer(klines);
    this.tracker = new PortfolioTracker(initialCash);
    this.simulator = new OrderSimulator((order) => {
      const existingIndex = this.allOrders.findIndex(o => o.orderId === order.orderId);
      if (existingIndex >= 0) {
        this.allOrders[existingIndex] = { ...order };
      } else {
        this.allOrders.push({ ...order });
      }
      this.tracker.handleOrderUpdate(order);
      this.strategy.onOrderUpdate(order);
    });

    const modeManager = new TradingModeManager('backtest', undefined, this.simulator);
    this.strategy.setContext(modeManager.getStrategyContext());
  }

  async run(): Promise<{ metrics: PerformanceMetrics, history: KLine[], orders: any[] }> {
    await this.strategy.onInit();
    console.log('Starting backtest...');

    const processedKlines: KLine[] = [];
    let dataCount = 0;

    while (this.replayer.hasNext()) {
      const kline = this.replayer.next();
      if (!kline) break;
      processedKlines.push(kline);
      dataCount++;

      // 1. Process orders first
      this.simulator.processKLine(kline);

      // 2. Trigger strategy
      await this.strategy.onData(kline);

      if (dataCount % 100 === 0) {
        console.log(`[Engine] Processed ${dataCount} bars... Current price: ${kline.close}`);
      }

      // 3. Record equity
      const fullSymbol = `${kline.symbol}.${kline.market}`;
      const currentPriceMap = new Map([
        [fullSymbol, kline.close],
        [kline.symbol, kline.close]
      ]);
      this.equityHistory.push({
        timestamp: kline.timestamp,
        equity: this.tracker.getTotalEquity(currentPriceMap),
      });
    }
    await this.strategy.onStop();
    
    const metrics = PerformanceAnalyzer.calculateMetrics(this.equityHistory, this.allOrders);
    return { metrics, history: processedKlines, orders: this.allOrders };
  }

  getEquityHistory() {
    return this.equityHistory;
  }
}