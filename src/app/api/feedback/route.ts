import { NextResponse } from 'next/server';
import { execute } from '@/database/postgres-raw';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name || '').trim();
    const event = String(body.event || '').trim();
    const rating = Number(body.rating);
    const comment = String(body.comment || '').trim();

    // Validation
    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!event) {
      return NextResponse.json({ error: 'Event is required' }, { status: 400 });
    }
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Insert into database
    const sql = `
      INSERT INTO event_feedback_submissions (name, event_name, rating, comment)
      VALUES ($1, $2, $3, $4)
    `;
    
    console.log('Attempting to insert feedback:', { name, event, rating, comment });
    const result = await execute(sql, [name, event, rating, comment || null]);
    console.log('Insert result:', result);

    return NextResponse.json({ ok: true, message: 'Feedback saved successfully' });
  } catch (e) {
    console.error('feedback write error:', e);
    const errorMessage = e instanceof Error ? e.message : String(e);
    const errorStack = e instanceof Error ? e.stack : undefined;
    console.error('Error details:', { errorMessage, errorStack });
    return NextResponse.json(
      { 
        error: 'Could not save feedback', 
        details: errorMessage,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    );
  }
}