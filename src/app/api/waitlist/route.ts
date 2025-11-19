import { NextResponse } from "next/server";
import getDb from "@/auth/db";

export async function GET(req: Request) {
  try {
    const db = await getDb();
    const res = await db.query(`
      SELECT 
        w.id,
        w.event_id,
        w.email,
        w.status,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location
      FROM waitlist w
      JOIN events e ON w.event_id = e.id
      WHERE w.status = 'waitlist'
      ORDER BY e.title, w.email
    `);
    return NextResponse.json({ waitlist: res.rows });
  } catch (err) {
    console.error("waitlist route error:", err);
    return NextResponse.json(
      { error: "internal server error", message: String((err as any).message ?? err) },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { waitlistIds } = body;

    if (!Array.isArray(waitlistIds) || waitlistIds.length === 0) {
      return NextResponse.json({ error: "waitlistIds array required" }, { status: 400 });
    }

    const db = await getDb();
    
    // Get waitlist entries with event details
    const placeholders = waitlistIds.map((_, i) => `$${i + 1}`).join(',');
    const res = await db.query(`
      SELECT 
        w.id,
        w.email,
        w.event_id,
        e.title as event_title,
        e.date as event_date,
        e.location as event_location
      FROM waitlist w
      JOIN events e ON w.event_id = e.id
      WHERE w.id IN (${placeholders}) AND w.status = 'waitlist'
    `, waitlistIds);

    if (res.rowCount === 0) {
      return NextResponse.json({ error: "No waitlist entries found or already confirmed" }, { status: 404 });
    }

    // Update status to confirmed
    await db.query(`
      UPDATE waitlist 
      SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
      WHERE id IN (${placeholders})
    `, waitlistIds);

    return NextResponse.json({ 
      ok: true, 
      updated: res.rowCount,
      entries: res.rows 
    });
  } catch (err) {
    console.error("waitlist update error:", err);
    return NextResponse.json(
      { error: "internal server error", message: String((err as any).message ?? err) },
      { status: 500 }
    );
  }
}

