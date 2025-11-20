import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://root:admin@localhost:5432/postgres",
});

export async function POST() {
  try {
    const sql = `
      UPDATE rewards_profile
      SET current_credits = GREATEST(current_credits - 100, 0);
    `;

    await pool.query(sql);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
