import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.POSTGRES_USER || "root",
  host: process.env.POSTGRES_HOST || "localhost",
  database: process.env.POSTGRES_DB || "campus_connect_db",
  password: process.env.POSTGRES_PASSWORD || "admin",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
});

export async function GET(req: NextRequest) {
  try {
    const result = await pool.query("SELECT * FROM events");
    return NextResponse.json(result.rows);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
