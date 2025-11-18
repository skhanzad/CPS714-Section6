'use client';

import { useState } from 'react';

const EVENTS = [
  'Club Fair',
  'Orientation',
  'Sports Day',
  'Tech Talk',
  'Workshop'
];

export default function PostEventPanel() {
  const [msg, setMsg] = useState<string | null>(null);

  async function submitFeedback(ev: React.FormEvent) {
    ev.preventDefault();
    const form = new FormData(ev.target as HTMLFormElement);
    const payload = {
      name: String(form.get('name') || ''),
      event: String(form.get('event') || ''),
      rating: Number(form.get('rating') || 0),
      comment: String(form.get('comment') || ''),
    };
    setMsg('Saving feedback...');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg('Feedback saved successfully!');
        // Reset form
        (ev.target as HTMLFormElement).reset();
      } else {
        setMsg(`Error: ${data.error || res.statusText}`);
      }
    } catch (error) {
      setMsg(`Error: ${error instanceof Error ? error.message : 'Failed to save feedback'}`);
    }
  }

  return (
    <div className="p-6 bg-white shadow rounded max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Post-Event Survey</h2>
      <p className="text-sm text-gray-600 mb-4">
        Help us improve by sharing your feedback about the event you attended.
      </p>
      <form onSubmit={submitFeedback} className="grid gap-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            placeholder="Enter your name"
            className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label htmlFor="event" className="block text-sm font-medium text-gray-700 mb-1">
            Event Name
          </label>
          <select
            id="event"
            name="event"
            className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select an event</option>
            {EVENTS.map((event) => (
              <option key={event} value={event}>
                {event}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <select
            id="rating"
            name="rating"
            className="border border-gray-300 rounded-md p-2 w-full focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select a rating</option>
            <option value="5">5 - Excellent</option>
            <option value="4">4 - Very Good</option>
            <option value="3">3 - Good</option>
            <option value="2">2 - Fair</option>
            <option value="1">1 - Poor</option>
          </select>
        </div>

        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Comments (Optional)
          </label>
          <textarea
            id="comment"
            name="comment"
            placeholder="Share your thoughts about the event..."
            className="border border-gray-300 rounded-md p-2 w-full h-28 resize-y focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors"
        >
          Save Feedback
        </button>
      </form>
      {msg && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          msg.includes('Error') 
            ? 'bg-red-50 text-red-700 border border-red-200' 
            : 'bg-green-50 text-green-700 border border-green-200'
        }`}>
          {msg}
        </div>
      )}
    </div>
  );
}