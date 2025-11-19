import { NextResponse } from "next/server";
import getDb from "@/auth/db";
import { sendBroadcast } from "@/utils/sendgrid";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, subject } = body;

    if (!eventId) {
      return NextResponse.json({ error: "eventId required" }, { status: 400 });
    }

    const db = await getDb();

    // Get event details including points
    const eventRes = await db.query(
      "SELECT id, title, date, location, points FROM events WHERE id = $1",
      [eventId]
    );

    if (eventRes.rowCount === 0) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    const event = eventRes.rows[0];
    const points = event.points || 0;

    if (points === 0) {
      return NextResponse.json(
        { error: "Event has no points assigned" },
        { status: 400 }
      );
    }

    // Get all users from reward_tracker
    const usersRes = await db.query(
      "SELECT user_email, current_points FROM reward_tracker ORDER BY user_email"
    );

    if (usersRes.rowCount === 0) {
      return NextResponse.json(
        { error: "No users in reward tracker" },
        { status: 404 }
      );
    }

    const users = usersRes.rows;
    const emails: string[] = [];
    const emailData: Array<{
      email: string;
      newPoints: number;
    }> = [];

    // Update points for each user and prepare email data
    for (const user of users) {
      const newPoints = (user.current_points || 0) + points;
      
      // Update user's points
      await db.query(
        "UPDATE reward_tracker SET current_points = $1, updated_at = CURRENT_TIMESTAMP WHERE user_email = $2",
        [newPoints, user.user_email]
      );

      emails.push(user.user_email);
      emailData.push({
        email: user.user_email,
        newPoints: newPoints,
      });
    }

    // Format date for email
    function formatDate(dateString: string): string {
      try {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      } catch {
        return dateString;
      }
    }

    const formattedDate = formatDate(event.date);

    // Send personalized emails to each user
    const emailPromises = emailData.map((item) => {
      const html = `<p>Thank you for attending <strong>${event.title}</strong>, you have earned ${points} points. Your total points is ${item.newPoints}.</p>`;
      return sendBroadcast(
        [item.email],
        subject || "New Reward Available",
        html
      );
    });

    const results = await Promise.allSettled(emailPromises);
    const successCount = results.filter((r) => r.status === "fulfilled").length;
    const failures = results.filter((r) => r.status === "rejected").length;

    return NextResponse.json({
      ok: true,
      sent: successCount,
      failures: failures,
      updated: users.length,
      pointsAwarded: points,
    });
  } catch (err: any) {
    console.error("rewards route error:", err);
    
    // Handle SendGrid errors
    if (err.message?.includes("SendGrid not configured")) {
      return NextResponse.json(
        {
          error: "SendGrid not configured",
          message:
            "Please set SENDGRID_API_KEY and SENDGRID_FROM_EMAIL environment variables",
        },
        { status: 500 }
      );
    }

    if (err.failures && err.failures.length > 0) {
      const hasCreditsExceeded = err.failures.some(
        (f: any) =>
          f.reason?.includes("Maximum credits exceeded") ||
          f.reason?.includes("credits")
      );
      if (hasCreditsExceeded) {
        return NextResponse.json(
          {
            error: "SendGrid credits exceeded",
            message:
              "Your SendGrid account has run out of email credits. The code is working correctly - points were updated for all users. Please upgrade your SendGrid plan or wait for credits to reset.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "internal server error",
        message: String(err.message ?? err),
      },
      { status: 500 }
    );
  }
}

