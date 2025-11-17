import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const event = String(body.event || '').replace(/"/g, '""');
    const rating = String(body.rating ?? '');
    const attendees = String(body.attendees ?? '');
    const comments = String(body.comments || '').replace(/"/g, '""');

    const row = `"${event}";${rating};${attendees};"${comments}"\n`;
    const file = path.join(process.cwd(), 'data', 'feedback.csv');

    await fs.appendFile(file, row, { encoding: 'utf8' });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('feedback write error', e);
    return NextResponse.json({ error: 'could not save feedback' }, { status: 500 });
  }
}