#!/usr/bin/env ts-node
/// <reference path="../types/omelette.d.ts" />

import omelette from 'omelette';
import path from 'path';
import fs from 'fs';

// 1. 极速拦截补全请求
const isCompletionRequest = process.argv.some(arg => arg.includes('--comp') || arg.includes('--completion'));

if (isCompletionRequest) {
  const completion = omelette('lbt');

  // 极简策略加载逻辑，不导入任何类，只读文件名
  const listStrategiesFast = () => {
    const strategyDir = path.join(__dirname, '../modules/strategy-framework');
    try {
      return fs.readdirSync(strategyDir)
        .filter(f => f.endsWith('.ts') && !f.startsWith('base-strategy') && !f.startsWith('hello-world'))
        .map(f => f.replace('.ts', ''));
    } catch {
      return [];
    }
  };

  // 极简符号加载逻辑，直接用原生的 sqlite3 避开 knex 的加载开销
  const getSymbolsFast = () => {
    // 补全时不查询数据库以获得极致速度，或者仅在 backtest/live 时才加载
    // 这里我们先返回常用选项，或者实现一个超轻量级的查询
    return ['700.HK', '9988.HK', 'AAPL.US', 'TSLA.US']; 
  };

  completion.tree({
    list: null,
    sync: null,
    backtest: () => {
      const strategies = listStrategiesFast();
      const tree: any = {};
      strategies.forEach(s => { tree[s] = getSymbolsFast; });
      return tree;
    },
    live: () => {
      const strategies = listStrategiesFast();
      const tree: any = {};
      strategies.forEach(s => { tree[s] = getSymbolsFast; });
      return tree;
    },
  });

  completion.init();

  if (process.argv.includes('--completion')) {
    completion.setupShellInitFile();
    process.exit(0);
  }

  if (process.argv.includes('--completion-fish')) {
    process.stdout.write((completion as any).generateCompletionCodeFish() + '\n');
    process.exit(0);
  }
}

// 2. 正常执行逻辑 - 延迟加载重型模块
async function run() {
  const { Command } = await import('commander');
  const chalk = (await import('chalk')).default;
  const { StrategyLoader } = await import('./strategy-loader');
  const { db, initDatabase } = await import('../modules/data-management/database');
  const Table = (await import('cli-table3')).default;
  const dayjs = (await import('dayjs')).default;

  const getSymbols = async () => {
    try {
      const results: any[] = await db('klines').distinct('symbol', 'market');
      return results.map(r => `${r.symbol}.${r.market}`);
    } catch {
      return [];
    }
  };

  const program = new Command();

  program
    .name('lbt')
    .description('Longbridge Trading System CLI')
    .version('1.0.0');

  program
    .command('list')
    .action(async () => {
      const strategies = StrategyLoader.listStrategies();
      const table = new Table({
        head: [chalk.cyan('Strategy Name'), chalk.cyan('Class Name'), chalk.cyan('Description')],
        colWidths: [25, 30, 50],
      });
      strategies.forEach(s => table.push([s.name, s.className, s.description]));
      console.log(table.toString());
    });

  program
    .command('sync')
    .argument('<symbols>', 'Symbols')
    .argument('[param]', 'Count/Date')
    .argument('[period]', 'Period', '1m')
    .action(async (symbolsStr, param, periodStr) => {
      await initDatabase();
      const { LongbridgeClient } = await import('../modules/longbridge-integration/client');
      const { QuoteProvider } = await import('../modules/longbridge-integration/quote-provider');
      const { DataManager } = await import('../modules/data-management/data-manager');
      const { DataSyncer } = await import('../modules/data-management/data-syncer');
      const { Period } = await import('longport');

      const periodMap: any = { '1m': Period.Min_1, '1d': Period.Day, '1w': Period.Week };
      const period = periodMap[periodStr.toLowerCase()] || Period.Min_1;
      
      const client = new LongbridgeClient();
      const quoteProvider = new QuoteProvider(client);
      const dataManager = new DataManager();
      const syncer = new DataSyncer(quoteProvider, dataManager);

      for (const symbol of symbolsStr.split(',').map((s: string) => s.trim())) {
        console.log(chalk.green(`\n--- Syncing ${symbol} ---`));
        await syncer.syncHistory(symbol, period, parseInt(param || '1000'));
      }
      process.exit(0);
    });

    program
    .command('backtest')
    .argument('[strategy]', 'Strategy')
    .argument('[symbol]', 'Symbol')
    .action(async (strategyName, symbolStr) => {
      const inquirer = (await import('inquirer')).default;
      const { BacktestFactory } = await import('../modules/backtesting-engine/factory');
      await initDatabase();
      
      const strategies = StrategyLoader.listStrategies();
      let finalStrategy = strategyName;

      if (!finalStrategy) {
        const ans = await inquirer.prompt([{ 
          type: 'list', 
          name: 's', 
          message: '请选择回测策略:',
          choices: strategies.map(s => ({
            name: `${s.name.padEnd(30)} | ${s.description}`,
            value: s.name,
            short: s.name // 选中后只显示名字，不显示描述，保持整洁
          }))
        }]);
        finalStrategy = ans.s;
      }

      const availableSymbols = await getSymbols();
      let finalSymbol = symbolStr;
      if (!finalSymbol) {
        const ans = await inquirer.prompt([{
          type: 'list',
          name: 'sym',
          message: '请选择股票代码 (从本地数据库):',
          choices: availableSymbols
        }]);
        finalSymbol = ans.sym;
      }

      console.log(chalk.yellow(`\n--- 🚀 正在启动回测: ${finalStrategy} 在 ${finalSymbol} ---`));
      
      try {
        const [sym, market] = finalSymbol.split('.');
        const strategy = await StrategyLoader.createStrategy(finalStrategy, {
          symbol: finalSymbol,
          periodType: 'daily',
          buyThresholdPercent: 0.005,
          sellThresholdPercent: 0.005,
          quantity: 100
        });

        const engine = await BacktestFactory.createFromDatabase(
          strategy,
          sym,
          market,
          '1', // 默认 1 分钟线
          dayjs().subtract(30, 'day').toISOString(),
          dayjs().toISOString()
        );

        const metrics = await engine.run();
        console.log(chalk.cyan('\n--- 📊 回测结果 ---'));
        console.table(metrics);
      } catch (err: any) {
        console.error(chalk.red(`回测执行失败: ${err.message}`));
      }
      process.exit(0);
    });

  program.parse();
}

if (!isCompletionRequest) {
  run().catch(console.error);
}
