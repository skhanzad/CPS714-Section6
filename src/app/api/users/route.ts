import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.POSTGRES_USER || "root",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "campus_connect_db",
  password: process.env.POSTGRES_PASSWORD || "admin",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

// GET /api/users → fetch all users
export async function GET(req: NextRequest) {
  try {
    const result = await pool.query("SELECT * FROM users");
    return NextResponse.json(result.rows, { status: 200 });
  } catch (err) {
    console.error("Failed to fetch users:", err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
