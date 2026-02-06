import { db } from './modules/data-management/database';

async function check() {
  const stats = await db('klines')
    .select('symbol', 'market', 'period')
    .count('* as count')
    .min('timestamp as earliest')
    .max('timestamp as latest')
    .groupBy('symbol', 'market', 'period');
  
  console.table(stats);
  process.exit(0);
}

check();
