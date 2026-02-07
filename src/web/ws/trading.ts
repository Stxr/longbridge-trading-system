import { Server } from 'socket.io';
import { LongbridgeClient } from '../../modules/longbridge-integration/client';
import { QuoteProvider } from '../../modules/longbridge-integration/quote-provider';

export function setupTradingWS(io: Server) {
  const client = new LongbridgeClient();
  const quoteProvider = new QuoteProvider(client);

  io.on('connection', (socket) => {
    console.log('Client connected to trading WS');

    socket.on('subscribe', async (symbols: string[]) => {
      try {
        await quoteProvider.init();
        
        quoteProvider.setOnQuote((quote) => {
          socket.emit('quote', quote);
        });

        quoteProvider.setOnKLine((kline) => {
          socket.emit('kline', kline);
        });

        await quoteProvider.subscribe(symbols);
        console.log(`Subscribed to ${symbols.join(', ')}`);
      } catch (error) {
        console.error('Subscription error:', error);
        socket.emit('error', 'Failed to subscribe to symbols');
      }
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected');
    });
  });
}
