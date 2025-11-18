import { NextResponse } from 'next/server';
import getDb from '@/auth/db';
import { sendBroadcast } from '@/utils/sendgrid';

type EmailRow = { email: string };

export async function POST(req: Request) {
  try {
    const { role, subject, html } = await req.json();
    if (!role) return NextResponse.json({ error: 'role required' }, { status: 400 });
    const db = await getDb();
    // Cast to a typed shape so rows are not `any`
    const res = await db.query('SELECT email FROM users WHERE role = $1 AND email IS NOT NULL', [role]) as { rows: EmailRow[] };
    const emails = res.rows.map((r) => r.email).filter(Boolean);
    if (!emails.length) return NextResponse.json({ error: 'no users for role' }, { status: 400 });
    await sendBroadcast(emails, subject || `Announcement for ${role}`, html || '');
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('broadcast-group error', e);
    return NextResponse.json({ error: 'failed to broadcast' }, { status: 500 });
  }
}