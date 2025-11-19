import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

// Validate environment variables
const requiredEnvVars = {
  POSTGRES_HOST: process.env.POSTGRES_HOST,
  POSTGRES_PORT: process.env.POSTGRES_PORT,
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing required environment variables:', missingVars);
}

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT) || 5432,
  user: process.env.POSTGRES_USER || 'root',
  password: process.env.POSTGRES_PASSWORD || 'admin',
  database: process.env.POSTGRES_DATABASE || 'campus_connect_db',
});

export async function query(sql: string, params: unknown[] = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function queryOne(sql: string, params: unknown[] = []) {
  const rows = await query(sql, params);
  return rows[0] ?? null;
}

export async function execute(sql: string, params: unknown[] = []) {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res.rowCount ?? 0;
  } catch (error) {
    console.error('Database execute error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  } finally {
    client.release();
  }
}

// Named export object to satisfy ESLint rule
const db = { query, queryOne, execute };
export default db;