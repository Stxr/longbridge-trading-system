#!/usr/bin/env ts-node
/// <reference path="../types/omelette.d.ts" />

import omelette from 'omelette';
import path from 'path';
import fs from 'fs';

// 1. 极速拦截补全请求
const isCompletionRequest = process.argv.some(arg => arg.includes('--comp') || arg.includes('--completion'));

if (isCompletionRequest) {
  const completion = omelette('lbt');

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

  const getSymbolsFast = () => ['700.HK', '9988.HK', 'AAPL.US', 'TSLA.US']; 

  completion.tree({
    list: null,
    sync: null,
    web: null,
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

// 2. 正常执行逻辑
async function run() {
  const { Command } = await import('commander');
  const chalk = (await import('chalk')).default;
  const { StrategyLoader } = await import('./strategy-loader');
  const { db, initDatabase } = await import('../modules/data-management/database');
  const Table = (await import('cli-table3')).default;
  const dayjs = (await import('dayjs')).default;

  const getSymbols = async () => {
    try {
      const stats: any[] = await db('klines')
        .select('symbol', 'market', 'period')
        .count('* as count')
        .min('timestamp as earliest')
        .max('timestamp as latest')
        .groupBy('symbol', 'market', 'period');
      
      return stats.map(r => {
        const fullSymbol = `${r.symbol}.${r.market}`;
        const start = dayjs(r.earliest).format('YYYY-MM-DD');
        const end = dayjs(r.latest).format('YYYY-MM-DD');
        const periodLabel = r.period === '1' ? '1m' : (r.period === '14' ? '1d' : r.period);
        
        return {
          name: `${fullSymbol.padEnd(10)} | 周期: ${periodLabel.padEnd(3)} | 数量: ${String(r.count).padStart(6)} 条 | 范围: ${start} -> ${end}`,
          value: { 
            symbol: r.symbol, 
            market: r.market, 
            period: r.period,
            earliest: r.earliest,
            latest: r.latest
          },
          short: `${fullSymbol} (${periodLabel})`
        };
      });
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
        await syncer.syncHistory(symbol, period, isNaN(Number(param)) ? param : parseInt(param || '1000'));
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

      // 1. Select Strategy
      if (!finalStrategy) {
        const ans = await inquirer.prompt([{ 
          type: 'list', 
          name: 's', 
          message: '请选择回测策略:',
          choices: strategies.map(s => ({
            name: `${s.name.padEnd(30)} | ${s.description}`,
            value: s.name,
            short: s.name
          }))
        }]);
        finalStrategy = ans.s;
      }

      const meta = strategies.find(s => s.name === finalStrategy);

      // 2. Select Symbol
      const availableSymbols = await getSymbols();
      let finalSymbolInfo: any = null;

      // ... (保持现有 Symbol 选择逻辑) ...

      if (!finalSymbolInfo) {
        const ans = await inquirer.prompt([{
          type: 'list',
          name: 'sym',
          message: '请选择股票代码 (从本地数据库):',
          choices: availableSymbols
        }]);
        finalSymbolInfo = ans.sym;
      }

      // 2.5 Input Initial Cash
      const { initialCash } = await inquirer.prompt([{
        type: 'number',
        name: 'initialCash',
        message: '请输入初始资金 (Initial Cash):',
        default: 100000,
      }]);

      // 3. Configure Strategy Parameters
      let strategyParams: any = { symbol: `${finalSymbolInfo.symbol}.${finalSymbolInfo.market}` };
      if (meta && meta.params && meta.params.length > 0) {
        console.log(chalk.blue(`\n--- ⚙️ 配置策略参数: ${finalStrategy} ---`));
        const paramAnswers = await inquirer.prompt(meta.params.map((p: any) => ({
          type: p.type === 'number' ? 'number' : 'input',
          name: p.name,
          message: `${p.message}:`,
          default: p.default,
        })));
        strategyParams = { ...strategyParams, ...paramAnswers };
      }

      // 4. Execution
      const finalSymbol = `${finalSymbolInfo.symbol}.${finalSymbolInfo.market}`;
      console.log(chalk.yellow(`\n--- 🚀 正在启动回测: ${finalStrategy} 在 ${finalSymbol} ---`));
      
      try {
        const strategy = await StrategyLoader.createStrategy(finalStrategy, strategyParams);

        const defaultStart = dayjs().subtract(30, 'day');
        const startTime = (dayjs(finalSymbolInfo.earliest).isAfter(defaultStart) 
          ? dayjs(finalSymbolInfo.earliest) 
          : defaultStart).toISOString();
        const endTime = dayjs(finalSymbolInfo.latest).toISOString();

        const engine = await BacktestFactory.createFromDatabase(
          strategy,
          finalSymbolInfo.symbol,
          finalSymbolInfo.market,
          finalSymbolInfo.period,
          startTime,
          endTime,
          initialCash // Use the user-provided initial cash
        );

        const { metrics, history, orders } = await engine.run();
        const equityValues = engine.getEquityHistory().map((e: any) => e.equity);
      

        console.log(chalk.cyan('\n--- 📊 回测结果 ---'));
        console.table({
          '初始资金': metrics.initialEquity.toLocaleString(),
          '最终净值': metrics.finalEquity.toLocaleString(),
          '总收益率': `${(metrics.totalReturn * 100).toFixed(2)}%`,
          '总手续费': metrics.totalCommission.toFixed(2),
          '最大回撤': `${(metrics.maxDrawdown * 100).toFixed(2)}%`,
          '夏普比率': metrics.sharpeRatio.toFixed(2),
          '胜率': `${(metrics.winRate * 100).toFixed(2)}%`,
          '总交易次数': metrics.totalTrades
        });
      } catch (err: any) {
        console.error(chalk.red(`回测执行失败: ${err.message}`));
      }
      process.exit(0);
    });

  program
    .command('web')
    .description('启动 Web 交易面板')
    .option('-p, --port <number>', '服务端口', '3000')
    .action(async (options) => {
      console.log(chalk.green('🚀 正在启动 Web 交易面板...'));
      process.env.PORT = options.port;
      
      const { server } = await import('../web/index');
      const open = (await import('open')).default;
      
      const url = `http://localhost:${options.port}`;
      console.log(chalk.cyan(`\n🔗 服务运行于: ${url}`));
      
      try {
        await open(url);
      } catch (err) {
        console.log(chalk.yellow(`无法自动打开浏览器，请手动访问: ${url}`));
      }
    });

  program.parse();
}

if (!isCompletionRequest) {
  run().catch(console.error);
}