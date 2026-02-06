import { QuoteProvider } from '../longbridge-integration/quote-provider';
import { DataManager } from './data-manager';
import { Period } from 'longport';
import { KLine } from '../../shared/models/market-data';
import { RateLimiter } from '../../shared/utils/rate-limiter';
import dayjs from 'dayjs';

export class DataSyncer {
  private quoteProvider: QuoteProvider;
  private dataManager: DataManager;
  private rateLimiter: RateLimiter;

  constructor(quoteProvider: QuoteProvider, dataManager: DataManager) {
    this.quoteProvider = quoteProvider;
    this.dataManager = dataManager;
    // Longbridge Quote API limit: 10 calls per second
    this.rateLimiter = new RateLimiter(10, 1000);
  }

  async syncHistory(symbol: string, period: Period, totalCount: number = 1000) {
    const marketSymbol = symbol.includes('.') ? symbol : `${symbol}.HK`;
    const [pureSymbol, market] = marketSymbol.split('.');
    
    console.log(`Starting large sync for ${marketSymbol} (${period}) - target total: ${totalCount}...`);

    let syncedCount = 0;
    let currentEndDate: Date | undefined = undefined;

    while (syncedCount < totalCount) {
      const batchSize = Math.min(1000, totalCount - syncedCount);
      await this.rateLimiter.acquire();
      
      let klines: KLine[];
      if (!currentEndDate) {
        klines = await this.quoteProvider.getHistoryCandlesticks(marketSymbol, period, batchSize);
      } else {
        klines = await this.quoteProvider.getHistoryCandlesticksBefore(marketSymbol, period, batchSize, currentEndDate);
      }
      
      if (klines.length === 0) {
        console.log('No more data available from provider.');
        break;
      }

      await this.dataManager.saveKLines(klines);
      
      // Calculate how many NEW bars were added (approximate)
      syncedCount += klines.length;
      
      const earliestInBatch = klines[0].timestamp;
      console.log(`Synced batch of ${klines.length}. Earliest timestamp in batch: ${earliestInBatch}`);

      // Set endDate for next batch to the timestamp of the earliest bar minus 1 second
      // so we don't fetch the same bar again
      const nextEndDate = dayjs(earliestInBatch).subtract(1, 'second').toDate();
      
      if (currentEndDate && dayjs(nextEndDate).isSame(dayjs(currentEndDate))) {
        console.log('Detected stuck sync, stopping.');
        break;
      }
      
      currentEndDate = nextEndDate;
    }
    
    console.log(`Sync complete. Total bars stored for ${marketSymbol}: ${syncedCount}`);
  }

  /**
   * Sync data for a specific symbol and period until a target start time is reached.
   */
  async syncUntil(symbol: string, period: Period, targetStartTime: string) {
    const marketSymbol = symbol.includes('.') ? symbol : `${symbol}.HK`;
    const targetDate = dayjs(targetStartTime);
    
    console.log(`Starting backward sync for ${marketSymbol} (${period}) until ${targetDate.format()}...`);

    let currentEndDate: Date | undefined = undefined;
    let totalSynced = 0;

    while (true) {
      await this.rateLimiter.acquire();
      
      let klines: KLine[];
      if (!currentEndDate) {
        klines = await this.quoteProvider.getHistoryCandlesticks(marketSymbol, period, 1000);
      } else {
        klines = await this.quoteProvider.getHistoryCandlesticksBefore(marketSymbol, period, 1000, currentEndDate);
      }
      
      if (klines.length === 0) {
        console.log('No more data available from provider.');
        break;
      }

      await this.dataManager.saveKLines(klines);
      totalSynced += klines.length;
      
      const earliestInBatch = klines[0].timestamp;
      console.log(`Synced batch. Earliest: ${earliestInBatch}. Total bars so far: ${totalSynced}`);

      if (dayjs(earliestInBatch).isBefore(targetDate) || dayjs(earliestInBatch).isSame(targetDate)) {
        console.log(`Reached target start time: ${targetStartTime}`);
        break;
      }

      const nextEndDate = dayjs(earliestInBatch).subtract(1, 'second').toDate();
      if (currentEndDate && dayjs(nextEndDate).isSame(dayjs(currentEndDate))) break;
      currentEndDate = nextEndDate;
    }
    
    console.log(`Sync complete. Total bars stored: ${totalSynced}`);
  }
}
