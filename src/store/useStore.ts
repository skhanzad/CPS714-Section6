import { create } from "zustand";

// Define types locally since the module import is broken
type BookingStatus = "pending" | "approved" | "denied";

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  capacity: number;
  status: "active" | "canceled";
  bookingId: string | null;
  attendees: Attendee[];
  attachments: Attachment[];
}

interface Booking {
  id: string;
  eventId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  resources: string[];
  status: BookingStatus;
  requestedBy: string;
}

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

interface Attendee {
  id: string;
  name: string;
  email?: string;
  checkedIn: boolean;
  qrId: string;
}

interface Attachment {
  id: string;
  type: "link" | "file";
  url: string;
  name?: string;
  mime?: string;
}

function genToken(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "CC-";
  for (let i = 0; i < len; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

function genId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
}

type State = {
  events: Event[];
  bookings: Booking[];
  rooms: Room[];
  resources: Resource[];
};

type Actions = {
  addEvent: (
    e: Omit<Event, "id" | "status" | "attendees"> & { id?: string }
  ) => Event;
  updateEvent: (id: string, patch: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  cancelEvent: (id: string) => void;
  addBooking: (
    b: Omit<Booking, "id" | "status"> & {
      status?: BookingStatus;
    }
  ) => Booking;
  setBookingStatus: (id: string, status: BookingStatus) => void;
  addAttendee: (eventId: string, att: { name: string; email?: string }) => Attendee;
  toggleCheckIn: (eventId: string, attendeeId: string, checked?: boolean) => void;
  checkInByQr: (qrId: string) => { eventId: string; attendeeId: string } | null;
  addAttachment: (eventId: string, attachment: Attachment) => void;
  removeAttachment: (eventId: string, attachmentId: string) => void;
  removeAttendee: (eventId: string, attendeeId: string) => void;
};

const seedRooms: Room[] = [
  { id: "R101", name: "Room 101", capacity: 40, features: ["projector"] },
  {
    id: "R202",
    name: "Lecture Hall 202",
    capacity: 120,
    features: ["projector", "microphone"],
  },
  {
    id: "M15",
    name: "Meeting Room 15",
    capacity: 12,
    features: ["whiteboard"],
  },
];

const seedResources: Resource[] = [
  { id: "res-projector", name: "Projector" },
  { id: "res-microphone", name: "Microphone" },
  { id: "res-catering", name: "Catering" },
];

export const useStore = create<State & Actions>((set, get) => ({
  events: [],
  bookings: [],
  rooms: seedRooms,
  resources: seedResources,

  addEvent: (e) => {
    const id = e.id ?? genId("evt");
    const newEvent: Event = {
      id,
      title: e.title,
      description: e.description,
      date: e.date,
      startTime: e.startTime,
      endTime: e.endTime,
      location: e.location,
      capacity: e.capacity,
      status: "active",
      bookingId: e.bookingId,
      attendees: [],
      attachments: e.attachments ?? [],
    };
    set((s: State) => ({ events: [...s.events, newEvent] }));
    return newEvent;
  },

  updateEvent: (id: string, patch: Partial<Event>) => {
    set((s: State) => ({
      events: s.events.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)),
    }));
  },

  deleteEvent: (id: string) => {
    set((s: State) => ({ events: s.events.filter((ev) => ev.id !== id) }));
  },

  cancelEvent: (id: string) => {
    set((s: State) => ({
      events: s.events.map((ev) =>
        ev.id === id ? { ...ev, status: "canceled" } : ev
      ),
    }));
  },

  addBooking: (b) => {
    const id = genId("bk");
    const newBooking: Booking = {
      id,
      eventId: b.eventId,
      roomId: b.roomId,
      startTime: b.startTime,
      endTime: b.endTime,
      resources: b.resources ?? [],
      status: b.status ?? "pending",
      requestedBy: b.requestedBy,
    };
    // naive conflict check: same room overlapping time
    const overlaps = get().bookings.some(
      (bk) =>
        bk.roomId === newBooking.roomId &&
        !(
          bk.endTime <= newBooking.startTime ||
          bk.startTime >= newBooking.endTime
        )
    );
    set((s: State) => ({ bookings: [...s.bookings, newBooking] }));
    if (overlaps) {
      // keep pending; UI can show conflict warning
    }
    return newBooking;
  },

  setBookingStatus: (id: string, status: BookingStatus) => {
    set((s: State) => ({
      bookings: s.bookings.map((bk) => (bk.id === id ? { ...bk, status } : bk)),
    }));
  },

  addAttendee: (eventId: string, att: { name: string; email?: string }) => {
    // Prevent duplicate attendee for same event when name+email match
    const normalizedEmail = att.email ?? "";
    const existing = get()
      .events.find((ev) => ev.id === eventId)
      ?.attendees.find(
        (a: Attendee) =>
          a.name === att.name && (a.email ?? "") === normalizedEmail
      );

    if (existing) {
      // Return existing attendee and do not add duplicate
      return existing;
    }

    const attendee: Attendee = {
      id: genId("att"),
      name: att.name,
      email: att.email,
      checkedIn: false,
      qrId: genToken(),
    };
    set((s: State) => ({
      events: s.events.map((ev) =>
        ev.id === eventId
          ? { ...ev, attendees: [...ev.attendees, attendee] }
          : ev
      ),
    }));
    return attendee;
  },

  toggleCheckIn: (eventId: string, attendeeId: string, checked?: boolean) => {
    set((s: State) => ({
      events: s.events.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              attendees: ev.attendees.map((a: Attendee) =>
                a.id === attendeeId
                  ? { ...a, checkedIn: checked ?? !a.checkedIn }
                  : a
              ),
            }
          : ev
      ),
    }));
  },

  checkInByQr: (qrId: string) => {
    const state = get();
    for (const ev of state.events) {
      const att = ev.attendees.find((a: Attendee) => a.qrId === qrId);
      if (att) {
        set((s: State) => ({
          events: s.events.map((e2) =>
            e2.id === ev.id
              ? {
                  ...e2,
                  attendees: e2.attendees.map((a2: Attendee) =>
                    a2.id === att.id ? { ...a2, checkedIn: true } : a2
                  ),
                }
              : e2
          ),
        }));
        return { eventId: ev.id, attendeeId: att.id };
      }
    }
    return null;
  },

  addAttachment: (eventId: string, attachment: Attachment) => {
    set((s: State) => ({
      events: s.events.map((ev) =>
        ev.id === eventId
          ? { ...ev, attachments: [...ev.attachments, attachment] }
          : ev
      ),
    }));
  },

  removeAttachment: (eventId: string, attachmentId: string) => {
    set((s: State) => ({
      events: s.events.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              attachments: ev.attachments.filter(
                (a: Attachment) => a.id !== attachmentId
              ),
            }
          : ev
      ),
    }));
  },

  removeAttendee: (eventId: string, attendeeId: string) => {
    set((s: State) => ({
      events: s.events.map((ev) =>
        ev.id === eventId
          ? {
              ...ev,
              attendees: ev.attendees.filter(
                (a: Attendee) => a.id !== attendeeId
              ),
            }
          : ev
      ),
    }));
  },
}));

// Export BookingStatus so it can be imported in other files
export type { BookingStatus };