import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../env.ts';
import { app } from '../http/app.ts';
import { schema } from './schema/index.ts';

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  connectionTimeoutMillis: 2000,
  ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
});

pool.on('error', (err) => {
  app.log.error({ err }, 'Unexpected error on idle client');
});

export const db = drizzle(pool, { schema: schema, casing: 'snake_case' });

export async function closeDatabase() {
  await pool.end();
}
