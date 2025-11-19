import sgMail from "@sendgrid/mail";

const API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

if (API_KEY) {
  sgMail.setApiKey(API_KEY);
  // sgMail.setDataResidency('eu'); // uncomment if using EU regional data residency
} else {
  console.warn("SENDGRID_API_KEY not set; emails will fail.");
}

function htmlToText(html: string) {
  // very small fallback text conversion
  return html.replace(/<\/?[^>]+(>|$)/g, " ").replace(/\s+/g, " ").trim();
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!API_KEY || !FROM_EMAIL) throw new Error("SendGrid not configured");
  const msg = {
    to,
    from: FROM_EMAIL,
    subject,
    text: htmlToText(html || ""),
    html,
  };
  try {
    const response = await sgMail.send(msg);
    return response;
  } catch (err: any) {
    // rethrow with SendGrid response body if present for better debugging
    const e = new Error(err?.message ?? "sendEmail failed");
    (e as any).response = err?.response ?? null;
    throw e;
  }
}

export async function sendBroadcast(toList: string[], subject: string, html: string) {
  if (!API_KEY || !FROM_EMAIL) throw new Error("SendGrid not configured");
  if (!Array.isArray(toList) || toList.length === 0) return { ok: true, sent: 0 };

  const msgs = toList.map((to) => ({
    to,
    from: FROM_EMAIL,
    subject,
    text: htmlToText(html || ""),
    html,
  }));

  // send in parallel but capture per-recipient success/failure
  const settled = await Promise.allSettled(msgs.map((m) => sgMail.send(m)));

  const successes = settled.filter((s) => s.status === "fulfilled").length;
  const failures = settled
    .map((s, i) => ({ s, to: msgs[i].to }))
    .filter((r) => r.s.status === "rejected")
    .map((r) => ({ to: r.to, reason: (r.s as PromiseRejectedResult).reason }));

  if (failures.length) {
    const agg = new Error(`sendBroadcast: ${failures.length} failures`);
    console.error('SendGrid Failures Details:', failures);
    (agg as any).failures = failures;
    (agg as any).successes = successes;
    throw agg;
  }

  return { ok: true, sent: successes };
}