'use client';

import { useState } from 'react';

export default function AdminPanel() {
  const [emailsText, setEmailsText] = useState('');
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('<p>Hello</p>');
  const [userId, setUserId] = useState('');
  const [role, setRole] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function sendBroadcastAll() {
    setMsg('sending...');
    const res = await fetch('/api/admin/broadcast-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, html }),
    });
    setMsg(res.ok ? 'Broadcast to all sent' : `Error: ${await res.text()}`);
  }

  async function sendBroadcastEmails() {
    setMsg('sending...');
    const emails = emailsText.split(/[\s,;]+/).map(e => e.trim()).filter(Boolean);
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'broadcast', emails, subject, html }),
    });
    setMsg(res.ok ? 'Broadcast sent' : `Error: ${await res.text()}`);
  }

  async function sendBroadcastRole() {
    setMsg('sending...');
    const res = await fetch('/api/admin/broadcast-group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, subject, html }),
    });
    setMsg(res.ok ? `Broadcast to ${role} sent` : `Error: ${await res.text()}`);
  }

  async function sendSingleSurvey() {
    setMsg('sending...');
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'single', userId, subject: subject || 'Survey', html }),
    });
    setMsg(res.ok ? 'Survey/notification sent' : `Error: ${await res.text()}`);
  }

  async function submitFeedback(ev: React.FormEvent) {
    ev.preventDefault();
    const form = new FormData(ev.target as HTMLFormElement);
    const payload = {
      event: form.get('event'),
      rating: form.get('rating'),
      attendees: form.get('attendees'),
      comments: form.get('comments'),
    };
    setMsg('saving feedback...');
    const res = await fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    setMsg(res.ok ? 'Feedback saved' : `Error: ${await res.text()}`);
  }

  return (
    <div className="p-6 bg-white shadow rounded max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-3">Admin Notification / Feedback Panel</h2>

      <section className="mb-4">
        <h3 className="font-semibold">Broadcast Announcement to ALL users</h3>
        <div className="flex gap-2 mt-2">
          <input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Subject" className="border p-2 flex-1" />
          <button onClick={sendBroadcastAll} className="bg-blue-600 text-white px-3 rounded">Send to All</button>
        </div>
      </section>

      <section className="mb-4">
        <h3 className="font-semibold">Broadcast to specific emails</h3>
        <textarea value={emailsText} onChange={e=>setEmailsText(e.target.value)} placeholder="one@example.com; two@..." className="w-full border p-2 h-20" />
        <div className="flex gap-2 mt-2">
          <button onClick={sendBroadcastEmails} className="bg-blue-600 text-white px-3 rounded">Send to Emails</button>
        </div>
      </section>

      <section className="mb-4">
        <h3 className="font-semibold">Broadcast to role/group</h3>
        <input value={role} onChange={e=>setRole(e.target.value)} placeholder="ROLE name" className="border p-2 w-1/2" />
        <button onClick={sendBroadcastRole} className="bg-blue-600 text-white px-3 rounded ml-2">Send to Role</button>
      </section>

      <section className="mb-4">
        <h3 className="font-semibold">Send single survey / notification to user</h3>
        <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder="userId (UUID)" className="border p-2 w-1/2" />
        <button onClick={sendSingleSurvey} className="bg-green-600 text-white px-3 rounded ml-2">Send</button>
      </section>

      <section className="mb-4">
        <h3 className="font-semibold">Email body (HTML)</h3>
        <textarea value={html} onChange={e=>setHtml(e.target.value)} className="w-full border p-2 h-28" />
      </section>

      <section className="mb-4">
        <h3 className="font-semibold">Submit Post-Event Feedback (any user)</h3>
        <form onSubmit={submitFeedback} className="grid gap-2">
          <input name="event" placeholder="Event name" className="border p-2" required />
          <input name="rating" type="number" step="0.1" min="0" max="5" placeholder="Rating (0-5)" className="border p-2" required />
          <input name="attendees" type="number" placeholder="Attendees count" className="border p-2" required />
          <textarea name="comments" placeholder="Optional comments" className="border p-2 h-20" />
          <button type="submit" className="bg-indigo-600 text-white px-3 py-2 rounded">Save Feedback</button>
        </form>
      </section>

      <div className="mt-3 text-sm text-gray-700">{msg}</div>
    </div>
  );
}