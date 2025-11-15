import { NextResponse } from "next/server";
import getDb from "@/auth/db";
import { sendEmail, sendBroadcast } from "@/utils/sendgrid";

/**
 POST payload examples:
 1) Single user by id:
    { type: "single", userId: "<uuid>", subject: "Reminder", html: "<p>...</p>" }
 2) Broadcast to explicit emails:
    { type: "broadcast", emails: ["a@x.com","b@x.com"], subject: "Announcement", html: "<p>...</p>" }
*/
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
            await sendEmail(email, subject || "Notification", html || "");
            return NextResponse.json({ ok: true });
        }

        if (type === "broadcast") {
            const target = Array.isArray(emails) && emails.length ? emails : null;
            if (!target) return NextResponse.json({ error: "emails required for broadcast" }, { status: 400 });
            await sendBroadcast(target, subject || "Announcement", html || "");
            return NextResponse.json({ ok: true });
        }

        return NextResponse.json({ error: "invalid type" }, { status: 400 });
    } catch (err) {
        console.error("notify route error:", err);
        return NextResponse.json({ error: "internal server error" }, { status: 500 });
    }
}