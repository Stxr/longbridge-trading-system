import { LongbridgeClient } from './modules/longbridge-integration/client';
import { QuoteProvider } from './modules/longbridge-integration/quote-provider';
import { DataManager } from './modules/data-management/data-manager';
import { DataSyncer } from './modules/data-management/data-syncer';
import { initDatabase } from './modules/data-management/database';
import { Period } from 'longport';
import dotenv from 'dotenv';

import dayjs from 'dayjs';

dotenv.config();

async function main() {
  const symbolsInput = process.argv[2] || '700.HK';
  const param = process.argv[3] || '1000'; // Can be count OR startTime
  const periodStr = process.argv[4] || '1m';

  const symbols = symbolsInput.split(',').map(s => s.trim());

  const periodMap: Record<string, Period> = {
    '1m': Period.Min_1,
    '5m': Period.Min_5,
    '15m': Period.Min_15,
    '30m': Period.Min_30,
    '60m': Period.Min_60,
    '1d': Period.Day,
    '1w': Period.Week,
    '1mon': Period.Month,
    '1y': Period.Year,
  };

  const period = periodMap[periodStr.toLowerCase()] || Period.Min_1;

  await initDatabase();
  
  const client = new LongbridgeClient();
  const quoteProvider = new QuoteProvider(client);
  const dataManager = new DataManager();
  const syncer = new DataSyncer(quoteProvider, dataManager);

  for (const symbol of symbols) {
    console.log(`\n--- Processing ${symbol} ---`);
    // If param is a date-like string, use syncUntil
    if (param.includes('-') || param.includes(':') || isNaN(Number(param))) {
      console.log(`Starting sync for ${symbol} (${periodStr}) back to ${param}...`);
      await syncer.syncUntil(symbol, period, param);
    } else {
      // Otherwise treat as count
      const count = parseInt(param);
      console.log(`Starting sync for ${symbol} (${periodStr}) with count ${count}...`);
      await syncer.syncHistory(symbol, period, count);
    }
  }
  
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
