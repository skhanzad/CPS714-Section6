"use client";

import { useState, useEffect } from "react";

const templateSubjects: Record<string, string> = {
  reminder: "Event Reminder",
  waitlist: "Waitlist Update",
  canceled: "Event Canceled",
  reward: "New Reward Available",
};

const staticTemplates: Record<string, string> = {
  waitlist: "<p>You are now on the waitlist for the event.</p>",
  reward: "<p>New reward opportunity — check it out!</p>",
};

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  points?: number;
}

interface WaitlistEntry {
  id: string;
  event_id: string;
  email: string;
  status: string;
  event_title: string;
  event_date: string;
  event_location: string;
}

export default function NotificationsPanel() {
  const [userId, setUserId] = useState("");
  const [tpl, setTpl] = useState("reminder");
  const [msg, setMsg] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [sending, setSending] = useState(false);
  const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
  const [selectedWaitlistIds, setSelectedWaitlistIds] = useState<Set<string>>(
    new Set()
  );
  const [loadingWaitlist, setLoadingWaitlist] = useState(false);

  useEffect(() => {
    // Clear message when switching templates
    setMsg(null);

    if (tpl === "reminder" || tpl === "canceled" || tpl === "reward") {
      fetchEvents();
    } else if (tpl === "waitlist") {
      fetchWaitlist();
    }
  }, [tpl]);

  async function fetchEvents() {
    setLoadingEvents(true);
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        if (data.events && data.events.length > 0 && !selectedEventId) {
          setSelectedEventId(data.events[0].id);
        }
      } else {
        setMsg("Failed to load events");
      }
    } catch (err) {
      console.error("Error fetching events:", err);
      setMsg("Error loading events");
    } finally {
      setLoadingEvents(false);
    }
  }

  async function fetchWaitlist() {
    setLoadingWaitlist(true);
    try {
      const res = await fetch("/api/waitlist");
      if (res.ok) {
        const data = await res.json();
        setWaitlistEntries(data.waitlist || []);
      } else {
        setMsg("Failed to load waitlist");
      }
    } catch (err) {
      console.error("Error fetching waitlist:", err);
      setMsg("Error loading waitlist");
    } finally {
      setLoadingWaitlist(false);
    }
  }

  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  }

  function getEventTemplate(): string {
    if (!selectedEventId) {
      return "<p>Please select an event.</p>";
    }

    const selectedEvent = events.find((e) => e.id === selectedEventId);
    if (!selectedEvent) {
      return "<p>Event not found.</p>";
    }

    const formattedDate = formatDate(selectedEvent.date);

    if (tpl === "reminder") {
      return `<p>The <strong>${selectedEvent.title}</strong> is coming up, ${formattedDate} at ${selectedEvent.location}.</p>`;
    } else if (tpl === "canceled") {
      return `<p>The event you are attending <strong>${selectedEvent.title}</strong>, on ${formattedDate}, at ${selectedEvent.location} has been cancelled.</p>`;
    }

    return "";
  }

  function handleWaitlistCheckbox(waitlistId: string, checked: boolean) {
    const newSelected = new Set(selectedWaitlistIds);
    if (checked) {
      newSelected.add(waitlistId);
    } else {
      newSelected.delete(waitlistId);
    }
    setSelectedWaitlistIds(newSelected);
  }

  async function confirmWaitlistUsers() {
    if (selectedWaitlistIds.size === 0) {
      setMsg("Please select at least one user to confirm.");
      return;
    }

    setSending(true);
    setMsg("Updating waitlist and sending emails...");

    try {
      // Update waitlist status
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waitlistIds: Array.from(selectedWaitlistIds) }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(`Error: ${data.error || data.message || "Unknown error"}`);
        setSending(false);
        return;
      }

      // Send confirmation emails
      const emails: string[] = [];
      const emailData: Array<{
        email: string;
        title: string;
        date: string;
        location: string;
      }> = [];

      for (const entry of data.entries) {
        emails.push(entry.email);
        emailData.push({
          email: entry.email,
          title: entry.event_title,
          date: entry.event_date,
          location: entry.event_location,
        });
      }

      // Send individual emails with personalized content
      const emailPromises = emailData.map((item) => {
        const formattedDate = formatDate(item.date);
        const html = `<p>You are no longer on the waitlist for <strong>${item.title}</strong> and can now attend, at ${item.location}, on ${formattedDate}.</p>`;
        return fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "broadcast",
            emails: [item.email],
            subject: templateSubjects.waitlist,
            html,
          }),
        });
      });

      const results = await Promise.allSettled(emailPromises);
      const successCount = results.filter(
        (r) => r.status === "fulfilled"
      ).length;

      // Refresh waitlist
      await fetchWaitlist();
      setSelectedWaitlistIds(new Set());

      setMsg(
        `Updated ${data.updated} user(s) and sent ${successCount} confirmation email(s)`
      );
    } catch (err) {
      console.error("Confirm waitlist error:", err);
      setMsg(
        `Error: ${err instanceof Error ? err.message : "Failed to confirm"}`
      );
    } finally {
      setSending(false);
    }
  }

  async function sendNotification() {
    if (tpl === "reminder" || tpl === "canceled") {
      if (!selectedEventId) {
        setMsg("Please select an event before sending.");
        return;
      }
      setSending(true);
      setMsg("Sending to all attendees...");
      const subject = templateSubjects[tpl];
      const html = getEventTemplate();
      try {
        const res = await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            type: "event_attendees",
            eventId: selectedEventId,
            subject,
            html,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setMsg(`Notification sent to ${data.sent || 0} attendee(s)`);
        } else {
          setMsg(`Error: ${data.error || data.message || "Unknown error"}`);
        }
      } catch (err) {
        console.error("Send notification error:", err);
        setMsg(
          `Error: ${err instanceof Error ? err.message : "Failed to send"}`
        );
      } finally {
        setSending(false);
      }
    } else if (tpl === "reward") {
      if (!selectedEventId) {
        setMsg("Please select an event before sending.");
        return;
      }
      setSending(true);
      setMsg("Sending rewards and updating points...");
      const subject = templateSubjects[tpl];
      try {
        const res = await fetch("/api/rewards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventId: selectedEventId,
            subject,
          }),
        });
        const data = await res.json();
        if (res.ok) {
          setMsg(
            `Rewards sent to ${data.updated || 0} user(s). ${
              data.pointsAwarded || 0
            } points awarded per user.`
          );
        } else {
          setMsg(`Error: ${data.error || data.message || "Unknown error"}`);
        }
      } catch (err) {
        console.error("Send rewards error:", err);
        setMsg(
          `Error: ${err instanceof Error ? err.message : "Failed to send"}`
        );
      } finally {
        setSending(false);
      }
    } else if (tpl === "waitlist") {
      // Waitlist is handled by confirmWaitlistUsers
      return;
    } else {
      if (!userId) {
        setMsg("Please enter a userId before sending.");
        return;
      }
      setSending(true);
      setMsg("sending...");
      const subject = templateSubjects[tpl];
      const html = staticTemplates[tpl] || "";
      try {
        const res = await fetch("/api/notify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "single", userId, subject, html }),
        });
        setMsg(res.ok ? "Notification sent" : `Error: ${await res.text()}`);
      } catch (err) {
        setMsg(
          `Error: ${err instanceof Error ? err.message : "Failed to send"}`
        );
      } finally {
        setSending(false);
      }
    }
  }

  return (
    <div className="p-6 bg-white shadow rounded max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-3">Automated Notifications</h2>

      <div className="mb-4">
        <label className="block mb-1 font-medium">Template</label>
        <select
          value={tpl}
          onChange={(e) => setTpl(e.target.value)}
          className="border p-2"
        >
          {Object.keys(templateSubjects).map((key) => (
            <option key={key} value={key}>
              {templateSubjects[key]}
            </option>
          ))}
        </select>
      </div>

      {(tpl === "reminder" || tpl === "canceled" || tpl === "reward") && (
        <div className="mb-4">
          <label className="block mb-1 font-medium">Select Event</label>
          {loadingEvents ? (
            <div className="text-sm text-gray-500">Loading events...</div>
          ) : (
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="border p-2 w-full"
            >
              <option value="">-- Select an event --</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.title}
                  {event.points ? ` (${event.points} points)` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {tpl === "waitlist" ? (
        <div className="mb-4">
          {loadingWaitlist ? (
            <div className="text-sm text-gray-500">Loading waitlist...</div>
          ) : waitlistEntries.length === 0 ? (
            <div className="text-sm text-gray-500">
              No waitlist entries found.
            </div>
          ) : (
            <>
              <div className="mb-3">
                <button
                  onClick={confirmWaitlistUsers}
                  disabled={selectedWaitlistIds.size === 0 || sending}
                  className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {sending
                    ? "Processing..."
                    : `Confirm Selected (${selectedWaitlistIds.size})`}
                </button>
              </div>
              <div className="border rounded overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-2 text-left">Select</th>
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Event</th>
                      <th className="p-2 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitlistEntries.map((entry) => (
                      <tr key={entry.id} className="border-t">
                        <td className="p-2">
                          <input
                            type="checkbox"
                            checked={selectedWaitlistIds.has(entry.id)}
                            onChange={(e) =>
                              handleWaitlistCheckbox(entry.id, e.target.checked)
                            }
                            className="cursor-pointer"
                          />
                        </td>
                        <td className="p-2">{entry.email}</td>
                        <td className="p-2">{entry.event_title}</td>
                        <td className="p-2">
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs">
                            {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      ) : tpl === "reminder" || tpl === "canceled" ? (
        <div className="mb-4">
          <button
            onClick={sendNotification}
            disabled={!selectedEventId || sending}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Send to All Attendees"}
          </button>
        </div>
      ) : tpl === "reward" ? (
        <div className="mb-4">
          <button
            onClick={sendNotification}
            disabled={!selectedEventId || sending}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {sending ? "Sending..." : "Send Rewards to All Users"}
          </button>
        </div>
      ) : (
        <div className="mb-4">
          <label className="block mb-1 font-medium">
            Send to user (userId)
          </label>
          <div className="flex gap-2">
            <input
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="userId (UUID)"
              className="border p-2 flex-1"
            />
            <button
              onClick={sendNotification}
              disabled={sending}
              className="bg-green-600 text-white px-3 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-3 text-sm text-gray-700">{msg}</div>
    </div>
  );
}
