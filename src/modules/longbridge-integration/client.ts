import { Config, QuoteContext, TradeContext } from 'longport';
import dotenv from 'dotenv';

dotenv.config();

export class LongbridgeClient {
  private config: Config;
  private quoteContext?: QuoteContext;
  private tradeContext?: TradeContext;

  constructor() {
    this.config = new Config({
      appKey: process.env.LONGPORT_APP_KEY || '',
      appSecret: process.env.LONGPORT_APP_SECRET || '',
      accessToken: process.env.LONGPORT_ACCESS_TOKEN || '',
      enablePrintQuotePackages: true,
    });
  }

  async getQuoteContext(): Promise<QuoteContext> {
    if (!this.quoteContext) {
      this.quoteContext = await QuoteContext.new(this.config);
    }
    return this.quoteContext;
  }

  async getTradeContext(): Promise<TradeContext> {
    if (!this.tradeContext) {
      this.tradeContext = await TradeContext.new(this.config);
    }
    return this.tradeContext;
  }
}
