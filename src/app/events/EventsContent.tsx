"use client";

import React, { useEffect, useState } from "react";

type EventItem = {
  id: number;
  event_name: string;
  event_date: string | null;
  location: string | null;
  capacity: number | null;
  rsvp_count: number | null;
};

type ConfirmationModal = {
  visible: boolean;
  message: string;
  status: "success" | "error" | null;
};

interface EventsContentProps {
  userId: string | null;
}

export default function EventsContent({ userId }: EventsContentProps) {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<Record<number, boolean>>({});
  const [modal, setModal] = useState<ConfirmationModal>({
    visible: false,
    message: "",
    status: null,
  });

  // Fetch events from api/events/available
  useEffect(() => {
    async function loadEvents() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/events/available", { cache: "no-store" });
        if (!res.ok) throw new Error(`Failed to load: ${res.status}`);
        const data = await res.json();
        setEvents(data.events || []);
      } catch (e: any) {
        setError(e.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);
  
  // This is to format the date properly
  function formatDate(dateStr: string | null) {
    if (!dateStr) return "TBD";
    return dateStr.split("T")[0];
  }
   // Modal to show confirmation or error when RSVP'ing
  function showModal(message: string, status: "success" | "error") {
    setModal({ visible: true, message, status });
  }

  function closeModal() {
    setModal({ visible: false, message: "", status: null });
  }

  // Handle when user clicks the RSVP/Interest button 
  async function handleRsvp(eventId: number) {
    // First check if user is logged in
    if (!userId) {
      showModal("Please login to RSVP", "error");
      return;
    }
    setSubmitting((s) => ({ ...s, [eventId]: true }));
    try {
      // Send RSVP request
      const res = await fetch(`/api/rsvp/${eventId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Handle if error occurs
        showModal(data.error || "Failed to RSVP", "error");
      } else {
        // Refresh event list to update capacities and show confirmation
        const updated = await (
          await fetch("/api/events/available", { cache: "no-store" })
        ).json();
        setEvents(updated.events || []);
        const statusMsg =
          data.status === "INTERESTED"
            ? "Marked as interested in this event!"
            : "Successfully RSVP'd for this event!";
        showModal(statusMsg, "success");
      }
    } catch (e: any) {
      showModal(e.message || "Error sending RSVP", "error");
    } finally {
      setSubmitting((s) => ({ ...s, [eventId]: false }));
    }
  }

  // Loading screen
  if (loading) return <div className="p-6">Loading events...</div>;

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-bold text-center text-blue-500">Events</h1>

        {error && <div className="p-6 text-red-600">Error: {error}</div>}

        {/* If there are no events currently */}
        <div className="p-6 space-y-4">
          {events.length === 0 && (
            <div>No events currently.</div>
          )}
          {/* List events */}
          {events.map((ev) => (
            <div
              key={ev.id}
              className="border rounded p-4 flex justify-between items-center"
            >
              <div>
                <div className="text-lg font-semibold">{ev.event_name}</div>
                <div className="text-sm text-white">
                    Date: {formatDate(ev.event_date)} 
                </div>
                <div className="text-sm text-white">
                    Location: {ev.location ?? "TBA"}
                </div>
                <div className="text-sm text-white">
                  {ev.capacity === null
                    ? "Unlimited capacity"
                    : `Capacity: ${ev.capacity} (${ev.rsvp_count ?? 0}/${ev.capacity} filled)`}
                </div>
              </div>
              <div>
                {/* RSVP/Interest button */}
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded disabled:opacity-60"
                  onClick={() => handleRsvp(ev.id)}
                  disabled={submitting[ev.id]}
                >
                  {submitting[ev.id] ? "Sending..." : "RSVP/Interested"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confirmation modal to show successful RSVP or if the user is already RSVP'd */}
      {modal.visible && (
        <div className="fixed inset-0 flex items-center justify-center backdrop-blur-sm z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-lg">
            <div className="flex items-start gap-4">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  modal.status === "success" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {modal.status === "success" ? "✓" : "!"}
              </div>
              <div className="flex-1">
                <p className="text-gray-800">{modal.message}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                className="bg-gray-200 text-black px-3 py-1 rounded"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
