import { NextResponse } from "next/server";
import getDb from "@/auth/db";

export async function GET(req: Request) {
  try {
    const db = await getDb();
    const res = await db.query("SELECT id, title, date, location, points FROM events ORDER BY title");
    return NextResponse.json({ events: res.rows });
  } catch (err) {
    console.error("events route error:", err);
    return NextResponse.json(
      { error: "internal server error", message: String((err as any).message ?? err) },
      { status: 500 }
    );
  }
}

