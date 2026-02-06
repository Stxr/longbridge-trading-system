import { BacktestEngine } from './index';
import { BaseStrategy } from '../strategy-framework/base-strategy';
import { DataManager } from '../data-management/data-manager';
import { Period } from 'longport';

export class BacktestFactory {
  static async createFromDatabase(
    strategy: BaseStrategy,
    symbol: string,
    market: string,
    period: string,
    startTime: string,
    endTime: string,
    initialCash: number = 1000000
  ): Promise<BacktestEngine> {
    const dataManager = new DataManager();
    const klines = await dataManager.getKLines(symbol, market, period, startTime, endTime);
    
    if (klines.length === 0) {
      throw new Error(`No data found in database for ${symbol}.${market} (${period}) from ${startTime} to ${endTime}`);
    }

    console.log(`Loaded ${klines.length} KLines from database for backtest.`);
    return new BacktestEngine(strategy, klines, initialCash);
  }
}
