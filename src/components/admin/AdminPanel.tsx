'use client';

import Link from 'next/link';

export default function AdminPanel() {
  return (
    <div className="p-6 bg-white shadow rounded max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-6">Admin: Notifications & Feedback</h2>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/admin/post-event" className="block bg-indigo-600 text-white p-4 rounded text-center hover:opacity-95">
          Post-Event Surveys
        </Link>

        <Link href="/admin/notifications" className="block bg-green-600 text-white p-4 rounded text-center hover:opacity-95">
          Automated Notifications
        </Link>

        <Link href="/admin/broadcast" className="block bg-blue-600 text-white p-4 rounded text-center hover:opacity-95">
          Broadcast Announcements
        </Link>
      </div>
    </div>
  );
}