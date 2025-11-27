import { NextResponse } from "next/server";
import getDb from "@/auth/db";

export async function GET(req: Request) {
  try {
    const db = await getDb();
    const res = await db.query("SELECT id, title, date, location, points FROM events ORDER BY title");
    return NextResponse.json({ events: res.rows });
  } catch (err) {
    console.error("events route error:", err);
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { 
        error: "internal server error", 
        message: errorMessage,
        details: process.env.NODE_ENV === "development" ? String(err) : undefined
      },
      { status: 500 }
    );
  }
}

