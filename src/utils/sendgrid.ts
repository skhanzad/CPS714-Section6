import sgMail from "@sendgrid/mail";

const API_KEY = process.env.SENDGRID_API_KEY;
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

if (API_KEY) sgMail.setApiKey(API_KEY);

export async function sendEmail(to: string, subject: string, html: string)
{
    if (!API_KEY || !FROM_EMAIL) throw new Error("SendGrid not configured");
    const msg = { to, from: FROM_EMAIL, subject, html };
    return sgMail.send(msg);
}

export async function sendBroadcast(toList: string[], subject: string, html: string)
{
    if (!API_KEY || !FROM_EMAIL) throw new Error("SendGrid not configured");
    const msgs = toList.map(to => ({ to, from: FROM_EMAIL, subject, html }));
    return sgMail.send(msgs);
}