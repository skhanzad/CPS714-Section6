import { useState, useMemo, FormEvent, useEffect } from "react";
import QrScanner from "./QrScanner";

interface Room {
  id: string;
  name: string;
  capacity: number;
  features: string[];
}

interface Resource {
  id: string;
  name: string;
}

interface Booking {
  id: string;
  room_id: string;
  start_time: string;
  end_time: string;
  resources: string[];
  status: string;
  requested_by: string;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  capacity: number;
  status: string;
  booking_id: string;
  attachments: Attachment[];
  attendees: Attendee[];
}

interface Attachment {
  id: string;
  type: string;
  url: string;
  name: string;
  mime?: string;
}

interface Attendee {
  id: string;
  name: string;
  email?: string;
  checked_in: boolean;
  qr_id: string;
}

const API = "http://localhost:3001";

export default function EventForm() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [events, setEvents] = useState<Event[]>([]);

  const [form, setForm] = useState<Partial<Event>>({
    title: "",
    description: "",
    date: "",
    start_time: "",
    end_time: "",
    location: "",
    capacity: undefined,
  });
  const [roomId, setRoomId] = useState("");
  const [requestedBy, setRequestedBy] = useState("Organizer");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [pendingAttachments, setPendingAttachments] = useState<Attachment[]>([]);
  const [linkInput, setLinkInput] = useState("");
  const [submitMsg, setSubmitMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, Partial<Event>>>({});
  const [scannerForEvent, setScannerForEvent] = useState<string | null>(null);
  const [scanMsg, setScanMsg] = useState("");
  const [attendeeDraft, setAttendeeDraft] = useState<Record<string, { name: string; email: string }>>({});
  const [attendeeError, setAttendeeError] = useState<Record<string, string | null>>({});

  // Fetch data from Express server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, resourcesRes, bookingsRes, eventsRes] = await Promise.all([
          fetch(`${API}/rooms`),
          fetch(`${API}/resources`),
          fetch(`${API}/bookings`),
          fetch(`${API}/events`)
        ]);

        const roomsData = await roomsRes.json();
        const resourcesData = await resourcesRes.json();
        const bookingsData = await bookingsRes.json();
        const eventsData = await eventsRes.json();

        setRooms(roomsData);
        setResources(resourcesData);
        setBookings(bookingsData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const isoStart = useMemo(
    () =>
      form.date && form.start_time ? `${form.date}T${form.start_time}:00` : "",
    [form.date, form.start_time]
  );
  const isoEnd = useMemo(
    () => (form.date && form.end_time ? `${form.date}T${form.end_time}:00` : ""),
    [form.date, form.end_time]
  );

  const overlaps = useMemo(() => {
    if (!roomId || !isoStart || !isoEnd) return false;
    return bookings.some(
      (bk) =>
        bk.room_id === roomId &&
        !(bk.end_time <= isoStart || bk.start_time >= isoEnd)
    );
  }, [bookings, roomId, isoStart, isoEnd]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitMsg("");
    if (!form.title || !form.date || !form.start_time || !form.location) {
      setSubmitMsg("Please fill Title, Location, Date and Start Time.");
      return;
    }
    setSubmitting(true);

    try {
      // Create event first
      const eventPayload = {
        title: form.title,
        description: form.description || "",
        date: form.date,
        start_time: form.start_time,
        end_time: form.end_time || null,
        location: form.location,
        capacity: form.capacity ?? null,
        booking_id: null,
        attachments: pendingAttachments.filter((a) => a.type === "link"),
      };

      const evRes = await fetch(`${API}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventPayload),
      });

      if (!evRes.ok) throw new Error(`Event creation failed: ${evRes.status}`);
      const eventResult = await evRes.json();

      let bookingId: string | null = null;

      // Create booking if room is selected
      if (roomId && isoStart && isoEnd) {
        const bookingPayload = {
          room_id: roomId,
          start_time: isoStart,
          end_time: isoEnd,
          resources: selectedResources,
          requested_by: requestedBy,
        };

        const bookingRes = await fetch(`${API}/bookings`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(bookingPayload),
        });

        if (bookingRes.ok) {
          const bookingResult = await bookingRes.json();
          bookingId = bookingResult.id;

          // Update event with booking ID
          await fetch(`${API}/events/${eventResult.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ booking_id: bookingId }),
          });
        }
      }

      setSubmitMsg("Event created successfully!");
      
      // Refresh events list
      const eventsRes = await fetch(`${API}/events`);
      const eventsData = await eventsRes.json();
      setEvents(eventsData);

      // Reset form
      setForm({
        title: "",
        description: "",
        date: "",
        start_time: "",
        end_time: "",
        location: "",
        capacity: undefined,
      });
      setRoomId("");
      setRequestedBy("Organizer");
      setSelectedResources([]);
      setPendingAttachments([]);
      setLinkInput("");

    } catch (error) {
      console.error('Failed to create event:', error);
      setSubmitMsg("Failed to create event. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const addLinkAttachment = () => {
    if (!linkInput) return;
    const att: Attachment = {
      id: `att-${Date.now()}`,
      type: "link",
      url: linkInput,
      name: linkInput,
    };
    setPendingAttachments((arr) => [...arr, att]);
    setLinkInput("");
  };

  const updateEvent = async (id: string, patch: Partial<Event>) => {
    try {
      const res = await fetch(`${API}/events/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });

      if (res.ok) {
        // Refresh events
        const eventsRes = await fetch(`${API}/events`);
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
        setEditingId(null);
      }
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      await fetch(`${API}/events/${id}`, { method: "DELETE" });
      
      // Refresh events
      const eventsRes = await fetch(`${API}/events`);
      const eventsData = await eventsRes.json();
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to delete event:', error);
    }
  };

  const addAttendee = async (eventId: string, attendee: { name: string; email?: string }) => {
    try {
      const res = await fetch(`${API}/events/${eventId}/attendees`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(attendee),
      });

      if (res.ok) {
        // Refresh events to get updated attendees
        const eventsRes = await fetch(`${API}/events`);
        const eventsData = await eventsRes.json();
        setEvents(eventsData);
        setAttendeeDraft((d) => ({
          ...d,
          [eventId]: { name: "", email: "" },
        }));
        setAttendeeError((errs) => ({ ...errs, [eventId]: null }));
      }
    } catch (error) {
      console.error('Failed to add attendee:', error);
    }
  };

  const toggleCheckIn = async (attendeeId: string, checkedIn: boolean) => {
    try {
      await fetch(`${API}/attendees/${attendeeId}/checkin`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked_in: checkedIn }),
      });

      // Refresh events to get updated check-in status
      const eventsRes = await fetch(`${API}/events`);
      const eventsData = await eventsRes.json();
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to update check-in:', error);
    }
  };

  const removeAttendee = async (attendeeId: string) => {
    try {
      await fetch(`${API}/attendees/${attendeeId}`, { method: "DELETE" });
      
      // Refresh events
      const eventsRes = await fetch(`${API}/events`);
      const eventsData = await eventsRes.json();
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to remove attendee:', error);
    }
  };

  const removeAttachment = async (attachmentId: string) => {
    try {
      await fetch(`${API}/attachments/${attachmentId}`, { method: "DELETE" });
      
      // Refresh events
      const eventsRes = await fetch(`${API}/events`);
      const eventsData = await eventsRes.json();
      setEvents(eventsData);
    } catch (error) {
      console.error('Failed to remove attachment:', error);
    }
  };

  const exportCsv = async (eventId: string) => {
    try {
      const res = await fetch(`${API}/events/${eventId}/attendees.csv`);
      if (!res.ok) throw new Error(`CSV export failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendees-${eventId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export CSV:', error);
    }
  };

  const onDetect = (token: string) => {
    // Simplified QR detection - in a real app, you'd match against attendee QR codes
    setScanMsg(`Scanned: ${token}`);
  };

  return (
    <div className="p-6 max-w-4xl">
      <h2 className="section-title text-xl font-semibold mb-4">
        Event Creation
      </h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={onSubmit}>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-black/70">Title</span>
          <input
            required
            className="border rounded px-3 py-2 w-full"
            value={form.title || ""}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          />
        </label>
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm text-black/70">Description (optional)</span>
          <textarea
            className="border rounded px-3 py-2 min-h-24 w-full"
            value={form.description || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-black/70">Location</span>
          <input
            required
            className="border rounded px-3 py-2 w-full"
            value={form.location || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-black/70">Date</span>
          <input
            required
            type="date"
            className="border rounded px-3 py-2 w-full"
            value={form.date || ""}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-black/70">Start Time</span>
            <input
              required
              type="time"
              className="border rounded px-3 py-2 w-full"
              value={form.start_time || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, start_time: e.target.value }))
              }
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-black/70">End Time</span>
            <input
              type="time"
              className="border rounded px-3 py-2 w-full"
              value={form.end_time || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, end_time: e.target.value }))
              }
            />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-black/70">Capacity</span>
          <input
            type="number"
            className="border rounded px-3 py-2 w-full"
            value={form.capacity ?? ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                capacity: e.target.value
                  ? parseInt(e.target.value, 10)
                  : undefined,
              }))
            }
          />
        </label>

        <div className="md:col-span-2 border-t border-black/10 pt-4 mt-2">
          <h3 className="section-title text-lg font-semibold mb-2">
            Room and Resource Booking
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-1">
              <span className="text-sm text-black/70">Room</span>
              <select
                className="border rounded px-3 py-2 w-full"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
              >
                <option value="">Select a room</option>
                {rooms.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} • {r.capacity} seats
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-black/70">Requested By</span>
              <input
                className="border rounded px-3 py-2 w-full"
                value={requestedBy}
                onChange={(e) => setRequestedBy(e.target.value)}
              />
            </label>
          </div>
          <span className="text-sm text-black/70">Resources</span>
          <div className="flex flex-wrap gap-3 mt-2">
            {resources.map((res) => (
              <label key={res.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedResources.includes(res.id)}
                  onChange={() =>
                    setSelectedResources((prev) =>
                      prev.includes(res.id)
                        ? prev.filter((r) => r !== res.id)
                        : [...prev, res.id]
                    )
                  }
                />
                <span className="text-black">{res.name}</span>
              </label>
            ))}
          </div>
          {overlaps && (
            <div className="text-sm text-amber-700 bg-amber-100 border border-amber-200 rounded p-2 mt-3">
              Warning: This booking overlaps with an existing booking for the
              selected room.
            </div>
          )}
        </div>

        <div className="md:col-span-2 border-t border-black/10 pt-4 mt-2">
          <h3 className="section-title text-lg font-semibold mb-2">
            Attachments
          </h3>
          <div className="flex gap-2 max-w-2xl">
            <input
              className="border rounded px-3 py-2 flex-1"
              placeholder="Paste a link (image, GIF, doc, etc.)"
              value={linkInput}
              onChange={(e) => setLinkInput(e.target.value)}
            />
            <button
              type="button"
              className="bg-black text-white rounded px-4 py-2 hover:bg-black/80 transition"
              onClick={addLinkAttachment}
            >
              Add Link
            </button>
          </div>
          <div className="mt-2">
            <input
              type="file"
              multiple
              accept="image/*,video/*,audio/*,.gif"
              onChange={() => {}}
              disabled
              className="opacity-50 cursor-not-allowed"
            />
            <p className="text-xs text-black/60 mt-1">
              Note: File uploads are currently disabled. Please use links to
              external files (e.g., Google Drive, Dropbox) instead.
            </p>
          </div>
          {pendingAttachments.length > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3">
              {pendingAttachments.map((a) => (
                <div
                  key={a.id}
                  className="border border-black/10 rounded p-2 relative group"
                >
                  <button
                    type="button"
                    onClick={() =>
                      setPendingAttachments((arr) =>
                        arr.filter((att) => att.id !== a.id)
                      )
                    }
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove"
                  >
                    ×
                  </button>
                  {a.mime?.startsWith("image") ||
                  (!a.mime &&
                    (a.url.endsWith(".png") ||
                      a.url.endsWith(".jpg") ||
                      a.url.endsWith(".gif"))) ? (
                    <img
                      src={a.url}
                      alt={a.name || "attachment"}
                      className="w-full h-24 object-cover rounded"
                    />
                  ) : (
                    <a
                      href={a.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-sm text-blue-700 underline break-all"
                    >
                      {a.name || a.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2 flex items-center gap-3">
          <button type="submit" className="bg-black text-white rounded px-4 py-2 hover:bg-black/80 transition" disabled={submitting}>
            {submitting ? "Creating…" : "Create Event"}
          </button>
        </div>
      </form>

      {submitMsg && <p className="text-sm text-amber-700 mt-2">{submitMsg}</p>}

      {/* Event List */}
      <div className="mt-6">
        <h3 className="section-title text-lg font-semibold mb-2">
          Events & Check-in
        </h3>
        <div className="space-y-2">
          {events.length === 0 && (
            <p className="text-black/60">No events yet. Create one above.</p>
          )}
          {events.map((ev) => {
            const bk = ev.booking_id
              ? bookings.find((b) => b.id === ev.booking_id)
              : undefined;
            const roomName = bk
              ? rooms.find((r) => r.id === bk.room_id)?.name
              : undefined;
            const resNames = bk
              ? bk.resources
                  .map(
                    (rid: string) =>
                      resources.find((r) => r.id === rid)?.name || rid
                  )
                  .join(", ")
              : "";
            const draft = attendeeDraft[ev.id] || { name: "", email: "" };
            const isEditing = editingId === ev.id;
            const currentDraft = editDraft[ev.id] || {
              title: ev.title,
              description: ev.description,
              location: ev.location,
              date: ev.date,
              start_time: ev.start_time,
              end_time: ev.end_time,
              capacity: ev.capacity,
            };

            return (
              <div
                key={ev.id}
                className="border border-black/10 rounded p-3 bg-white/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    {!isEditing ? (
                      <>
                        <p className="font-medium text-black">
                          {ev.title}{" "}
                          <span className="text-xs text-black/60">({ev.status})</span>
                        </p>
                        <p className="text-sm text-black/70">
                          {ev.date} {ev.start_time} @ {ev.location}{" "}
                          {roomName ? `• Room: ${roomName}` : ""}
                        </p>
                        {resNames && (
                          <p className="text-sm text-black/70">
                            Resources: {resNames}
                          </p>
                        )}
                        {ev.description && (
                          <p className="text-sm text-black/80 mt-2">
                            {ev.description}
                          </p>
                        )}
                        {ev.attachments && ev.attachments.length > 0 && (
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2">
                            {ev.attachments.map((a) => (
                              <div
                                key={a.id}
                                className="border border-black/10 rounded p-1 relative group"
                              >
                                <button
                                  onClick={() => removeAttachment(a.id)}
                                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  title="Remove"
                                >
                                  ×
                                </button>
                                {a.mime?.startsWith("image") ||
                                (!a.mime &&
                                  (a.url.endsWith(".png") ||
                                    a.url.endsWith(".jpg") ||
                                    a.url.endsWith(".gif"))) ? (
                                  <img
                                    src={a.url}
                                    alt={a.name || "attachment"}
                                    className="w-full h-20 object-cover rounded"
                                  />
                                ) : (
                                  <a
                                    href={a.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-xs text-blue-700 underline break-all"
                                  >
                                    {a.name || a.url}
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={currentDraft.title || ""}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              [ev.id]: { ...currentDraft, title: e.target.value },
                            }))
                          }
                        />
                        <input
                          className="border rounded px-2 py-1 w-full"
                          value={currentDraft.location || ""}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              [ev.id]: {
                                ...currentDraft,
                                location: e.target.value,
                              },
                            }))
                          }
                        />
                        <textarea
                          className="border rounded px-2 py-1 md:col-span-2 w-full"
                          value={currentDraft.description || ""}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              [ev.id]: {
                                ...currentDraft,
                                description: e.target.value,
                              },
                            }))
                          }
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            className="border rounded px-2 py-1 w-full"
                            value={currentDraft.date || ""}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...d,
                                [ev.id]: {
                                  ...currentDraft,
                                  date: e.target.value,
                                },
                              }))
                            }
                          />
                          <input
                            type="time"
                            className="border rounded px-2 py-1 w-full"
                            value={currentDraft.start_time || ""}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...d,
                                [ev.id]: {
                                  ...currentDraft,
                                  start_time: e.target.value,
                                },
                              }))
                            }
                          />
                          <input
                            type="time"
                            className="border rounded px-2 py-1 w-full"
                            value={currentDraft.end_time || ""}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...d,
                                [ev.id]: {
                                  ...currentDraft,
                                  end_time: e.target.value,
                                },
                              }))
                            }
                          />
                          <input
                            type="number"
                            className="border rounded px-2 py-1 w-full"
                            value={currentDraft.capacity ?? ""}
                            onChange={(e) =>
                              setEditDraft((d) => ({
                                ...d,
                                [ev.id]: {
                                  ...currentDraft,
                                  capacity: e.target.value
                                    ? parseInt(e.target.value, 10)
                                    : undefined,
                                },
                              }))
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 shrink-0">
                    {!isEditing ? (
                      <>
                        <button
                          className="text-black hover:underline text-sm"
                          onClick={() => setEditingId(ev.id)}
                        >
                          Edit
                        </button>
                        <button
                          className="text-red-700 hover:underline text-sm"
                          onClick={() => deleteEvent(ev.id)}
                        >
                          Delete
                        </button>
                        <button
                          className="text-black hover:underline text-sm"
                          onClick={() => exportCsv(ev.id)}
                        >
                          Export CSV
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="text-green-700 hover:underline text-sm"
                          onClick={() => updateEvent(ev.id, currentDraft)}
                        >
                          Save
                        </button>
                        <button
                          className="text-black hover:underline text-sm"
                          onClick={() => setEditingId(null)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium text-black">
                    Check-in List
                  </p>
                  <div className="flex gap-2 mt-2 max-w-2xl">
                    <input
                      className="border rounded px-3 py-2 flex-1"
                      placeholder="Name"
                      value={draft.name}
                      onChange={(e) => {
                        setAttendeeDraft((d) => ({
                          ...d,
                          [ev.id]: { ...draft, name: e.target.value },
                        }));
                      }}
                    />
                    <input
                      className={`border rounded px-3 py-2 flex-1 ${
                        attendeeError[ev.id] ? "border-red-600" : ""
                      }`}
                      placeholder="Email (optional)"
                      value={draft.email}
                      onChange={(e) => {
                        setAttendeeDraft((d) => ({
                          ...d,
                          [ev.id]: { ...draft, email: e.target.value },
                        }));
                        setAttendeeError((errs) => ({ ...errs, [ev.id]: null }));
                      }}
                    />
                    <button
                      className="bg-black text-white rounded px-4 py-2 hover:bg-black/80 transition"
                      onClick={() => {
                        if (!draft.name) return;
                        addAttendee(ev.id, { name: draft.name, email: draft.email || undefined });
                      }}
                    >
                      Add
                    </button>
                  </div>
                  {attendeeError[ev.id] && (
                    <p className="text-red-600 text-sm mt-1">
                      {attendeeError[ev.id]}
                    </p>
                  )}

                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {ev.attendees && ev.attendees.map((a) => (
                      <div
                        key={a.id}
                        className="border border-black/10 rounded p-2 flex items-center gap-3"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-black">
                            {a.name}
                          </p>
                          {a.email && (
                            <p className="text-xs text-black/70">{a.email}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1 text-sm">
                            <input
                              type="checkbox"
                              checked={a.checked_in}
                              onChange={() => {
                                toggleCheckIn(a.id, !a.checked_in);
                              }}
                            />
                            <span className={a.checked_in ? "text-green-700" : "text-red-700"}>
                              {a.checked_in ? "Present" : "Absent"}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="text-red-700 hover:underline text-xs"
                          onClick={() => removeAttendee(a.id)}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3">
                    <button
                      className="text-black underline text-sm"
                      onClick={() => setScannerForEvent((cur) => (cur === ev.id ? null : ev.id))}
                    >
                      Open scanner
                    </button>
                    {scannerForEvent === ev.id && (
                      <div className="mt-2">
                        <QrScanner onDetect={(token) => {
                          // Find attendee by QR code and check them in
                          const attendee = ev.attendees.find(a => a.qr_id === token);
                          if (attendee) {
                            toggleCheckIn(attendee.id, true);
                            setScanMsg(`Checked in: ${attendee.name}`);
                          } else {
                            setScanMsg(`No attendee found with QR: ${token}`);
                          }
                        }} />
                        {scanMsg && (
                          <p className="text-sm text-black/70 mt-2">{scanMsg}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}