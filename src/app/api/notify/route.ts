import { NextResponse } from "next/server";
import getDb from "@/auth/db";
import { sendEmail, sendBroadcast } from "@/utils/sendgrid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, userId, emails, subject, html } = body;

    if (type === "single") {
      if (!userId) return NextResponse.json({ error: "userId required" }, { status: 400 });
      const db = await getDb();
      const res = await db.query("SELECT email FROM users WHERE id = $1", [userId]);
      if (res.rowCount === 0) return NextResponse.json({ error: "user not found" }, { status: 404 });
      const email = res.rows[0].email;
      try {
        await sendEmail(email, subject || "Notification", html || "");
      } catch (err: any) {
        console.error("sendEmail error:", err);
        return NextResponse.json({ error: "sendEmail failed", message: err.message, detail: err.response?.body ?? null }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    if (type === "broadcast") {
      const target = Array.isArray(emails) && emails.length ? emails : null;
      if (!target) return NextResponse.json({ error: "emails required for broadcast" }, { status: 400 });
      try {
        await sendBroadcast(target, subject || "Announcement", html || "");
      } catch (err: any) {
        console.error("sendBroadcast error:", err);
        return NextResponse.json({ error: "sendBroadcast failed", message: err.message, detail: err.response?.body ?? null }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "invalid type" }, { status: 400 });
  } catch (err) {
    console.error("notify route error:", err);
    return NextResponse.json({ error: "internal server error", message: String((err as any).message ?? err) }, { status: 500 });
  }
}