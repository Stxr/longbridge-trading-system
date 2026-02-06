import knex from 'knex';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const dbPath = process.env.DATABASE_URL || './trading_system.sqlite';

export const db = knex({
  client: 'sqlite3',
  connection: {
    filename: dbPath,
  },
  useNullAsDefault: true,
});

export async function initDatabase() {
  if (!(await db.schema.hasTable('klines'))) {
    await db.schema.createTable('klines', (table) => {
      table.increments('id').primary();
      table.string('symbol').notNullable();
      table.string('market').notNullable();
      table.string('period').notNullable().defaultTo('1m');
      table.string('timestamp').notNullable();
      table.decimal('open').notNullable();
      table.decimal('high').notNullable();
      table.decimal('low').notNullable();
      table.decimal('close').notNullable();
      table.bigInteger('volume').notNullable();
      table.decimal('turnover');
      table.unique(['symbol', 'market', 'period', 'timestamp']);
    });
  }

  if (!(await db.schema.hasTable('orders'))) {
    await db.schema.createTable('orders', (table) => {
      table.string('orderId').primary();
      table.string('symbol').notNullable();
      table.string('market').notNullable();
      table.string('side').notNullable();
      table.decimal('price');
      table.decimal('quantity').notNullable();
      table.decimal('executedQuantity').notNullable();
      table.string('status').notNullable();
      table.string('createdAt').notNullable();
      table.string('updatedAt').notNullable();
    });
  }

  if (!(await db.schema.hasTable('positions'))) {
    await db.schema.createTable('positions', (table) => {
      table.string('symbol').notNullable();
      table.string('market').notNullable();
      table.decimal('quantity').notNullable();
      table.decimal('averageCost').notNullable();
      table.primary(['symbol', 'market']);
    });
  }
}
