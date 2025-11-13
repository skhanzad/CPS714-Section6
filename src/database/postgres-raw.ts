import 'dotenv/config';
import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
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
  } finally {
    client.release();
  }
}

// Named export object to satisfy ESLint rule
const db = { query, queryOne, execute };
export default db;