import { LongbridgeClient } from './modules/longbridge-integration/client';
import { QuoteProvider } from './modules/longbridge-integration/quote-provider';
import dotenv from 'dotenv';

dotenv.config();

async function runIntegrationTest() {
  console.log('Starting Longbridge Integration Test...');
  
  if (!process.env.LONGPORT_APP_KEY || process.env.LONGPORT_APP_KEY === 'your_app_key') {
    console.log('Skipping real API test: No credentials provided in .env');
    return;
  }

  const client = new LongbridgeClient();
  const quoteProvider = new QuoteProvider(client);

  quoteProvider.setOnQuote((quote) => {
    console.log(`[Quote] ${quote.symbol}: ${quote.lastPrice}`);
  });

  quoteProvider.setOnKLine((kline) => {
    console.log(`[KLine] ${kline.symbol}: Open=${kline.open}, Close=${kline.close}`);
  });

  try {
    await quoteProvider.init();
    console.log('Subscribing to 700.HK and AAPL.US...');
    await quoteProvider.subscribe(['700.HK', 'AAPL.US']);
    
    console.log('Waiting 10 seconds for data...');
    await new Promise(resolve => setTimeout(resolve, 10000));
  } catch (err) {
    console.error('Integration Test Error:', err);
  } finally {
    console.log('Test finished.');
    process.exit(0);
  }
}

runIntegrationTest();
