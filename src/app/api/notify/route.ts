import { NextResponse } from "next/server";
import getDb from "@/auth/db";
import { sendEmail, sendBroadcast } from "@/utils/sendgrid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { type, userId, emails, eventId, subject, html } = body;

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

    if (type === "event_attendees") {
      if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });
      try {
        const db = await getDb();
        // Query test_attendees table instead of attendees table, filtered by event_id
        const res = await db.query("SELECT email FROM test_attendees WHERE event_id = $1 AND email IS NOT NULL", [eventId]);
        if (res.rowCount === 0) {
          return NextResponse.json({ error: "no test attendees found" }, { status: 404 });
        }
        const attendeeEmails = res.rows.map((row) => row.email).filter((email) => email);
        if (attendeeEmails.length === 0) {
          return NextResponse.json({ error: "no valid email addresses found in test_attendees" }, { status: 404 });
        }
        try {
          const result = await sendBroadcast(attendeeEmails, subject || "Event Notification", html || "");
          return NextResponse.json({ 
            ok: true, 
            sent: result.sent || attendeeEmails.length,
            failures: result.failures || 0
          });
        } catch (err: any) {
          console.error("sendBroadcast error:", err);
          const errorMsg = err.message || "Unknown error";
          // Check if it's a SendGrid configuration issue
          if (errorMsg.includes("SendGrid not configured") || errorMsg.includes("not configured")) {
            return NextResponse.json({ 
              error: "SendGrid not configured", 
              message: "Please set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL environment variables" 
            }, { status: 500 });
          }
          // Extract SendGrid error details if available
          let detail = err.response || err.detail || null;
          if (err.failures && err.failures.length > 0) {
            detail = { failures: err.failures };
            // Check for common SendGrid errors
            const hasForbidden = err.failures.some((f: any) => f.reason === 'Forbidden');
            const hasUnauthorized = err.failures.some((f: any) => f.reason === 'Unauthorized');
            const hasCreditsExceeded = err.failures.some((f: any) => f.reason?.includes('Maximum credits exceeded') || f.reason?.includes('credits'));
            
            if (hasCreditsExceeded) {
              return NextResponse.json({ 
                error: "SendGrid credits exceeded", 
                message: `Your SendGrid account has run out of email credits. The code is working correctly - it prepared to send to ${attendeeEmails.length} test attendees. Please upgrade your SendGrid plan or wait for credits to reset.`,
                detail: detail
              }, { status: 500 });
            }
            
            if (hasForbidden || hasUnauthorized) {
              return NextResponse.json({ 
                error: "SendGrid authentication error", 
                message: "The sender email address needs to be verified in SendGrid. Please verify your SENDGRID_FROM_EMAIL in your SendGrid account.",
                detail: detail
              }, { status: 500 });
            }
          }
          return NextResponse.json({ 
            error: "sendBroadcast failed", 
            message: errorMsg, 
            detail: detail
          }, { status: 500 });
        }
      } catch (dbErr: any) {
        console.error("Database error in event_attendees:", dbErr);
        console.error("Error stack:", dbErr.stack);
        return NextResponse.json({ 
          error: "Database error", 
          message: dbErr.message || "Failed to query attendees",
          details: dbErr.stack 
        }, { status: 500 });
      }
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