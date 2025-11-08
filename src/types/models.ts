export type EventStatus = "active" | "canceled";

export interface Attachment {
  id: string;
  type: "link" | "file";
  url: string;
  name?: string;
  mime?: string;
}

export interface Attendee {
  id: string;
  name: string;
  email?: string;
  checkedIn: boolean;
  qrId: string; // unique QR token
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  date: string; // yyyy-mm-dd
  startTime: string; // HH:mm
  endTime?: string; // HH:mm
  location: string;
  capacity?: number;
  status: EventStatus;
  bookingId?: string;
  attendees: Attendee[];
  attachments: Attachment[];
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  features: string[]; // e.g., ['projector', 'microphone']
}

export interface Resource {
  id: string;
  name: string;
}

export type BookingStatus = "pending" | "approved" | "denied";

export interface Booking {
  id: string;
  eventId?: string; // optional link to an event
  roomId: string;
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  resources: string[]; // resource ids
  status: BookingStatus;
  requestedBy: string; // organizer id or name
}
