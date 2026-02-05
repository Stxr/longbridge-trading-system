import { QuoteContext, SubType, PushQuoteEvent, PushCandlestickEvent, Period, TradeSessions } from 'longport';
import { LongbridgeClient } from './client';
import { Quote, KLine, MarketSchema } from '../../shared/models/market-data';

export class QuoteProvider {
  private client: LongbridgeClient;
  private onQuoteCallback?: (quote: Quote) => void;
  private onKLineCallback?: (kline: KLine) => void;

  constructor(client: LongbridgeClient) {
    this.client = client;
  }

  async init() {
    const ctx = await this.client.getQuoteContext();
    ctx.setOnQuote((err, event) => {
      if (err) return console.error('Quote Error:', err);
      this.handleQuote(event);
    });
    ctx.setOnCandlestick((err, event) => {
      if (err) return console.error('Candlestick Error:', err);
      this.handleCandlestick(event);
    });
  }

  async subscribe(symbols: string[]) {
    const ctx = await this.client.getQuoteContext();
    await ctx.subscribe(symbols, [SubType.Quote]);
    for (const symbol of symbols) {
      await ctx.subscribeCandlesticks(symbol, Period.Min_1, TradeSessions.Intraday);
    }
  }

  setOnQuote(callback: (quote: Quote) => void) {
    this.onQuoteCallback = callback;
  }

  setOnKLine(callback: (kline: KLine) => void) {
    this.onKLineCallback = callback;
  }

  private handleQuote(event: PushQuoteEvent) {
    const [symbol, marketStr] = event.symbol.split('.');
    const data = event.data;
    const quote: Quote = {
      symbol,
      market: MarketSchema.parse(marketStr),
      timestamp: data.timestamp.toISOString(),
      lastPrice: Number(data.lastDone),
      open: Number(data.open),
      high: Number(data.high),
      low: Number(data.low),
      volume: Number(data.volume),
      turnover: Number(data.turnover),
    };
    this.onQuoteCallback?.(quote);
  }

  private handleCandlestick(event: PushCandlestickEvent) {
    const [symbol, marketStr] = event.symbol.split('.');
    const data = event.data.candlestick;
    const kline: KLine = {
      symbol,
      market: MarketSchema.parse(marketStr),
      timestamp: data.timestamp.toISOString(),
      open: Number(data.open),
      high: Number(data.high),
      low: Number(data.low),
      close: Number(data.close),
      volume: Number(data.volume),
      turnover: Number(data.turnover),
    };
    this.onKLineCallback?.(kline);
  }
}