'use client';

import { useState } from 'react';

export default function BroadcastPanel() {
  const [subject, setSubject] = useState('');
  const [html, setHtml] = useState('<p>Announcement</p>');
  const [emailsText, setEmailsText] = useState('');
  const [msg, setMsg] = useState<string | null>(null);

  async function sendAll() {
    setMsg('sending to all...');
    const res = await fetch('/api/admin/broadcast-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subject, html }),
    });
    setMsg(res.ok ? 'Sent to all' : `Error: ${await res.text()}`);
  }

  async function sendEmails() {
    setMsg('sending to emails...');
    const emails = emailsText.split(/[\s,;]+/).map(e => e.trim()).filter(Boolean);
    if (!emails.length) {
      setMsg('Please provide at least one email.');
      return;
    }
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'broadcast', emails, subject, html }),
    });
    setMsg(res.ok ? 'Sent to emails' : `Error: ${await res.text()}`);
  }

  return (
    <div className="p-6 bg-white shadow rounded max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-3">Broadcast Announcements</h2>

      <div className="mb-4">
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Subject" className="border p-2 w-full mb-2" />
        <textarea value={html} onChange={e => setHtml(e.target.value)} className="w-full border p-2 h-24 mb-2" />
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={sendAll} className="bg-blue-600 text-white px-3 py-2 rounded">Send to All</button>
      </div>

      <div className="mb-4">
        <textarea value={emailsText} onChange={e => setEmailsText(e.target.value)} placeholder="one@example.com; two@..." className="w-full border p-2 h-20 mb-2" />
        <button onClick={sendEmails} className="bg-blue-600 text-white px-3 py-2 rounded">Send to Emails</button>
      </div>

      <div className="mt-3 text-sm text-gray-700">{msg}</div>
    </div>
  );
}