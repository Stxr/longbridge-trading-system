import { db } from './database';
import { KLine, KLineSchema } from '../../shared/models/market-data';

export class DataManager {
  async saveKLines(klines: KLine[]) {
    await db('klines')
      .insert(klines)
      .onConflict(['symbol', 'market', 'timestamp'])
      .merge();
  }

  async getKLines(
    symbol: string,
    market: string,
    startTime: string,
    endTime: string
  ): Promise<KLine[]> {
    const records = await db('klines')
      .where({ symbol, market })
      .andWhere('timestamp', '>=', startTime)
      .andWhere('timestamp', '<=', endTime)
      .orderBy('timestamp', 'asc');

    return records.map((r) => KLineSchema.parse(r));
  }

  async getLatestKLine(symbol: string, market: string): Promise<KLine | null> {
    const record = await db('klines')
      .where({ symbol, market })
      .orderBy('timestamp', 'desc')
      .first();

    return record ? KLineSchema.parse(record) : null;
  }
}
