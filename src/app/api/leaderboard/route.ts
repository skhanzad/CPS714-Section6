import { NextResponse } from "next/server";
import { Pool } from "pg";

declare global {
  var __pgPool: Pool | undefined;
}

const connectionString =
  process.env.DATABASE_URL ||
  "postgresql://root:admin@localhost:5432/postgres";

const pool = global.__pgPool ?? new Pool({ connectionString });

// @ts-ignore
if (!global.__pgPool) global.__pgPool = pool;

export async function GET() {
  try {
    // Query explanation:
    // - Join users -> rewards_profile -> credit_transactions
    // - total_accumulated: prefer SUM(credit_transactions.amount) if any; otherwise fallback to rewards_profile.earned_credits (fallback 0)
    // - current_credits: from rewards_profile.current_credits (fallback 0)
    // - group by user/profile fields
    const sql = `
      SELECT
        u.id,
        u.first_name,
        u.last_name,
        COALESCE(SUM(ct.amount), rp.earned_credits, 0) AS total_accumulated,
        COALESCE(rp.current_credits, 0) AS current_credits
      FROM users u
      LEFT JOIN rewards_profile rp ON rp.user_id = u.id
      LEFT JOIN credit_transactions ct ON ct.profile_id = rp.id
      GROUP BY u.id, u.first_name, u.last_name, rp.earned_credits, rp.current_credits
      ORDER BY total_accumulated DESC
      LIMIT 200;
    `;

    const { rows } = await pool.query(sql);

    const results = rows.map((r: any, idx: number) => ({
      rank: idx + 1,
      userId: r.id,
      name: `${r.first_name ?? ""} ${r.last_name ?? ""}`.trim(),
      totalAccumulated: Number(r.total_accumulated ?? 0),
      currentCredits: Number(r.current_credits ?? 0),
    }));

    return NextResponse.json({ ok: true, data: results }, { status: 200 });
  } catch (err: any) {
    console.error("Leaderboard error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch leaderboard" },
      { status: 500 }
    );
  }
}
