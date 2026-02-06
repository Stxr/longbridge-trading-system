import { db } from './database';
import { KLine, KLineSchema } from '../../shared/models/market-data';

export class DataManager {
  async saveKLines(klines: KLine[]) {
    const chunkSize = 200;
    for (let i = 0; i < klines.length; i += chunkSize) {
      const chunk = klines.slice(i, i + chunkSize);
      await db('klines')
        .insert(chunk)
        .onConflict(['symbol', 'market', 'period', 'timestamp'])
        .merge();
    }
  }

  async getKLines(
    symbol: string,
    market: string,
    period: string,
    startTime: string,
    endTime: string
  ): Promise<KLine[]> {
    const records = await db('klines')
      .where({ symbol, market, period })
      .andWhere('timestamp', '>=', startTime)
      .andWhere('timestamp', '<=', endTime)
      .orderBy('timestamp', 'asc');

    return records.map((r) => KLineSchema.parse(r));
  }

  async getLatestKLine(symbol: string, market: string, period: string): Promise<KLine | null> {
    const record = await db('klines')
      .where({ symbol, market, period })
      .orderBy('timestamp', 'desc')
      .first();

    return record ? KLineSchema.parse(record) : null;
  }

  async getEarliestKLine(symbol: string, market: string, period: string): Promise<KLine | null> {
    const record = await db('klines')
      .where({ symbol, market, period })
      .orderBy('timestamp', 'asc')
      .first();

    return record ? KLineSchema.parse(record) : null;
  }
}
