import 'dotenv/config';
import pg, { QueryResultRow } from 'pg'; // <-- ADDED 'QueryResultRow'

const { Pool } = pg;

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE,
});

/**
 * Executes a SQL query and returns an array of rows.
 * @template T The type of the database row. Must extend QueryResultRow.
 */
// ADDED 'T extends QueryResultRow' to constrain the generic type
export async function query<T extends QueryResultRow>(sql: string, params: unknown[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query<T>(sql, params);
    return res.rows;
  } finally {
    client.release();
  }
}

export async function execute(sql: string, params: unknown[] = []): Promise<number> {
  const client = await pool.connect();
  try {
    const res = await client.query(sql, params);
    return res.rowCount ?? 0;
  } finally {
    client.release();
  }
}

const db = { query, execute }; // <-- Named export (from previous fix)
export default db;