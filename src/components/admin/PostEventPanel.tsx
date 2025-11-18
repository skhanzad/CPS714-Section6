'use client';

import { useState } from 'react';

export default function PostEventPanel() {
  const [msg, setMsg] = useState<string | null>(null);

  async function submitFeedback(ev: React.FormEvent) {
    ev.preventDefault();
    const form = new FormData(ev.target as HTMLFormElement);
    const payload = {
      event: String(form.get('event') || ''),
      rating: Number(form.get('rating') || 0),
      attendees: Number(form.get('attendees') || 0),
      comments: String(form.get('comments') || ''),
    };
    setMsg('saving feedback...');
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setMsg(res.ok ? 'Feedback saved' : `Error: ${res.statusText || await res.text()}`);
  }

  return (
    <div className="p-6 bg-white shadow rounded max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-3">Post-Event Survey</h2>
      <form onSubmit={submitFeedback} className="grid gap-2">
        <input name="event" placeholder="Event name" className="border p-2" required />
        <input name="rating" type="number" step="0.1" min="0" max="5" placeholder="Rating (0-5)" className="border p-2" required />
        <input name="attendees" type="number" placeholder="Attendees count" className="border p-2" required />
        <textarea name="comments" placeholder="Optional comments" className="border p-2 h-28" />
        <button type="submit" className="bg-indigo-600 text-white px-3 py-2 rounded">Save Feedback</button>
      </form>
      <div className="mt-3 text-sm text-gray-700">{msg}</div>
    </div>
  );
}