import { Router } from 'express';
import { StrategyLoader } from '../../cli/strategy-loader';
import { BacktestEngine } from '../../modules/backtesting-engine';
import { DataManager } from '../../modules/data-management/data-manager';
import { DataSyncer } from '../../modules/data-management/data-syncer';
import { LongbridgeClient } from '../../modules/longbridge-integration/client';
import { QuoteProvider } from '../../modules/longbridge-integration/quote-provider';
import { Period } from 'longport';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const client = new LongbridgeClient();
const quoteProvider = new QuoteProvider(client);

// Simple in-memory task storage
const tasks = new Map<string, {
  status: 'running' | 'completed' | 'failed',
  result?: any,
  error?: string,
  progress: number
}>();

router.post('/', async (req, res) => {
  const { strategyName, symbol: fullSymbol, start, end, initialCash, params, period: periodKey = '1d' } = req.body;

  if (!strategyName || !fullSymbol || !start || !end) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  const taskId = uuidv4();
  tasks.set(taskId, { status: 'running', progress: 0 });

  // Run backtest asynchronously
  (async () => {
    try {
      const [symbol, market] = fullSymbol.split('.');
      const dataManager = new DataManager();
      
      const periodMap: Record<string, Period> = {
        '1m': Period.Min_1,
        '2m': Period.Min_2,
        '5m': Period.Min_5,
        '15m': Period.Min_15,
        '30m': Period.Min_30,
        '1h': Period.Min_60,
        '1d': Period.Day,
        '1w': Period.Week,
        '1mo': Period.Month
      };

      const selectedPeriod = periodMap[periodKey] || Period.Day;
      const periodStr = selectedPeriod.toString();
      
      console.log(`[Backtest] Querying DB: symbol=${symbol}, market=${market}, period=${periodStr} (${periodKey}), range=${start} to ${end}`);
      
      // 1. Check if data exists, if not, sync from Longbridge
      let klines = await dataManager.getKLines(symbol, market || 'HK', periodStr, start, end);
      
      if (klines.length === 0) {
        console.log(`No local data for ${fullSymbol} (${periodKey}), attempting to sync from Longbridge...`);
        const syncer = new DataSyncer(quoteProvider, dataManager);
        await quoteProvider.init();
        await syncer.syncUntil(fullSymbol, selectedPeriod, start);
        
        // Re-fetch after sync
        klines = await dataManager.getKLines(symbol, market || 'HK', periodStr, start, end);
      }
      
      if (klines.length === 0) {
        tasks.set(taskId, { status: 'failed', error: 'No data found for the given range even after sync', progress: 0 });
        return;
      }

      const strategy = await StrategyLoader.createStrategy(strategyName, { ...params, symbol: fullSymbol });
      const engine = new BacktestEngine(strategy, klines, initialCash || 1000000);
      
      const result = await engine.run();
      const equityHistory = engine.getEquityHistory();

      tasks.set(taskId, {
        status: 'completed',
        progress: 100,
        result: {
          ...result,
          equityHistory
        }
      });
    } catch (error: any) {
      console.error('Backtest error:', error);
      tasks.set(taskId, { status: 'failed', error: error.message, progress: 0 });
    }
  })();

  res.json({ taskId });
});

router.get('/:taskId', (req, res) => {
  const task = tasks.get(req.params.taskId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }
  res.json(task);
});

export default router;