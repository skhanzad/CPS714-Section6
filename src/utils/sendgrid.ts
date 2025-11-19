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
    .map((r) => {
      const reason = (r.s as PromiseRejectedResult).reason;
      const errorMsg = reason instanceof Error ? reason.message : String(reason);
      const responseBody = (reason as any)?.response?.body;
      // Extract more detailed error information from SendGrid
      let detailedError = errorMsg;
      if (responseBody && responseBody.errors && responseBody.errors.length > 0) {
        const firstError = responseBody.errors[0];
        detailedError = firstError.message || errorMsg;
        // Only log usage limit errors
        if (firstError.message?.includes('credits') || firstError.message?.includes('Maximum credits exceeded')) {
          console.error('SendGrid usage limit error:', firstError.message);
        }
      }
      return { 
        to: r.to, 
        reason: detailedError,
        detail: responseBody
      };
    });

  if (failures.length > 0) {
    // If all failed, throw error. If some succeeded, return partial success info
    if (successes === 0) {
      const firstFailure = failures[0];
      let errorMsg = firstFailure.reason || "All emails failed to send";
      
      // Provide more helpful error messages
      if (errorMsg.includes('Forbidden') || errorMsg.includes('Unauthorized')) {
        const detailMsg = firstFailure.detail?.errors?.[0]?.message || firstFailure.reason;
        errorMsg = `SendGrid authentication failed: ${detailMsg}. Please verify: 1) Your SENDGRID_FROM_EMAIL (${FROM_EMAIL}) is verified in SendGrid, 2) Your API key has Mail Send permissions.`;
      } else if (errorMsg.includes('Maximum credits exceeded') || errorMsg.includes('credits')) {
        console.error(`SendGrid usage limit exceeded: Attempted to send ${toList.length} emails but account has no credits remaining.`);
        errorMsg = `SendGrid account has run out of email credits. Please upgrade your SendGrid plan or wait for credits to reset. The code is working correctly - all ${toList.length} emails were prepared to send.`;
      }
      
      const agg = new Error(errorMsg);
      (agg as any).failures = failures;
      (agg as any).successes = 0;
      (agg as any).response = firstFailure.detail;
      throw agg;
    } else {
      // Partial success - return info but don't throw
      console.warn(`SendGrid: ${successes} succeeded, ${failures.length} failed`);
      return { ok: true, sent: successes, failures: failures.length };
    }
  }

  return { ok: true, sent: successes };
}