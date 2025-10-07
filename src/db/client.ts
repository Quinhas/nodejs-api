import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../env.ts';
import { logger } from '../shared/logger.ts';
import { schema } from './schema/index.ts';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  connectionTimeoutMillis: 2000,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

pool.on('error', (err) => {
  logger.error(
    {
      err,
      poolTotalCount: pool.totalCount,
      poolIdleCount: pool.idleCount,
      poolWaitingCount: pool.waitingCount,
    },
    'Unexpected error on idle client'
  );
});

export const db = drizzle(pool, { schema: schema, casing: 'snake_case' });

type IDB = typeof db;
export type { IDB };

export async function validateConnection() {
  try {
    await pool.query('SELECT 1');
    logger.info('Database connection established');
  } catch (error) {
    logger.error({ error }, 'Failed to connect to database');
    throw error;
  }
}

export async function closeDatabase() {
  await pool.end();
}
