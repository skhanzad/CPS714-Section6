import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://root:admin@localhost:5432/postgres",
});

export async function POST() {
  try {
    // Add to rewards_profile AND credit_transactions
    const sql = `
      UPDATE rewards_profile
      SET earned_credits = earned_credits + 100,
          current_credits = current_credits + 100;

      INSERT INTO credit_transactions (profile_id, amount)
      SELECT id, 100 FROM rewards_profile;
    `;

    await pool.query(sql);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
