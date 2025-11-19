'use client';

import { useState } from 'react';

const templates: Record<string, { subject: string; html: string }> = {
  reminder: { subject: 'Event Reminder', html: '<p>Reminder: your event is coming up.</p>' },
  waitlist: { subject: 'Waitlist Update', html: '<p>You are now on the waitlist for the event.</p>' },
  canceled: { subject: 'Event Canceled', html: '<p>We are sorry — this event has been canceled.</p>' },
  reward: { subject: 'New Reward Available', html: '<p>New reward opportunity — check it out!</p>' },
};

export default function NotificationsPanel() {
  const [userId, setUserId] = useState('');
  const [tpl, setTpl] = useState('reminder');
  const [msg, setMsg] = useState<string | null>(null);

  async function sendSingle() {
    setMsg('sending...');
    const { subject, html } = templates[tpl];
    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'single', userId, subject, html }),
    });
    setMsg(res.ok ? 'Notification sent' : `Error: ${await res.text()}`);
  }

  return (
    <div className="p-6 bg-white shadow rounded max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-3">Automated Notifications</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Template</label>
        <select value={tpl} onChange={e => setTpl(e.target.value)} className="border p-2">
          {Object.keys(templates).map(key => (
            <option key={key} value={key}>{templates[key].subject}</option>
          ))}
        </select>
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Send to user (userId)</label>
        <div className="flex gap-2">
          <input value={userId} onChange={e => setUserId(e.target.value)} placeholder="userId (UUID)" className="border p-2 flex-1" />
          <button onClick={sendSingle} className="bg-green-600 text-white px-3 rounded">Send</button>
        </div>
      </div>

      <div className="mt-3 text-sm text-gray-700">{msg}</div>
    </div>
  );
}