import express, { Request, Response } from "express";
import cors from "cors";
import { randomUUID } from "node:crypto";
import { QueryResultRow } from "pg";
import db from "./database.js";

const app = express();
app.use(cors());
app.use(express.json({ limit: "2mb" }));

// Types
interface Room extends QueryResultRow {
  id: string;
  name: string;
  capacity: number;
  features: string;
}

interface Booking extends QueryResultRow {
  id: string;
  room_id: string;
  start_time: string;
  end_time: string;
  resources: string;
  status: string;
  requested_by: string;
}

interface Event extends QueryResultRow {
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
}

interface Attendee extends QueryResultRow {
  id: string;
  event_id: string;
  name: string;
  email: string | null;
  checked_in: boolean;
  qr_id: string;
}

interface Attachment extends QueryResultRow {
  id: string;
  event_id: string;
  type: string;
  url: string;
  name: string | null;
  mime: string | null;
}

const listRooms = async (): Promise<Room[]> => {
  const rooms = await db.query<Room>("SELECT * FROM rooms");
  return rooms;
};

const listResources = async (): Promise<QueryResultRow[]> => {
  return await db.query("SELECT * FROM resources");
};

const listBookings = async (): Promise<Booking[]> => {
  const bookings = await db.query<Booking>("SELECT * FROM bookings ORDER BY start_time DESC");
  return bookings.map((b) => ({
    ...b,
    resources: JSON.parse(b.resources),
  }));
};

const listEvents = async (): Promise<(Event & { attendees: Attendee[], attachments: Attachment[] })[]> => {
  const events = await db.query<Event>("SELECT * FROM events ORDER BY date DESC, start_time DESC");
  
  const eventsWithDetails = await Promise.all(
    events.map(async (event) => {
      const attendees = await db.query<Attendee>("SELECT * FROM attendees WHERE event_id = $1", [event.id]);
      const attachments = await db.query<Attachment>("SELECT * FROM attachments WHERE event_id = $1", [event.id]);
      
      return {
        ...event,
        attendees: attendees.map(a => ({ ...a, checked_in: !!a.checked_in })),
        attachments: attachments
      };
    })
  );
  
  return eventsWithDetails;
};

const getEvent = async (id: string): Promise<(Event & { attendees: Attendee[], attachments: Attachment[] }) | null> => {
  const events = await db.query<Event>("SELECT * FROM events WHERE id = $1", [id]);
  if (events.length === 0) return null;
  const ev = events[0];
  
  const attendees = await db.query<Attendee>("SELECT * FROM attendees WHERE event_id = $1", [id]);
  const attachments = await db.query<Attachment>("SELECT * FROM attachments WHERE event_id = $1", [id]);
  
  return {
    ...ev,
    attendees: attendees.map((a) => ({ ...a, checked_in: !!a.checked_in })),
    attachments,
  };
};

// ---------- Routes ----------
app.get("/rooms", async (req: Request, res: Response) => res.json(await listRooms()));
app.get("/resources", async (req: Request, res: Response) => res.json(await listResources()));
app.get("/bookings", async (req: Request, res: Response) => res.json(await listBookings()));
app.get("/events", async (req: Request, res: Response) => res.json(await listEvents()));

app.get("/events/:id", async (req: Request, res: Response) => {
    const event = await getEvent(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });
    res.json(event);
});

// CSV Export for attendees
app.get("/events/:id/attendees.csv", async (req: Request, res: Response) => {
  try {
    const event = await getEvent(req.params.id);
    if (!event) return res.status(404).json({ error: "Event not found" });

    const headers = ["Name", "Email", "Checked In", "QR Code"];
    const rows = event.attendees.map(attendee => [
      `"${attendee.name}"`,
      `"${attendee.email || ''}"`,
      attendee.checked_in ? "Yes" : "No",
      `"${attendee.qr_id}"`
    ]);

    const csvContent = [headers.join(","), ...rows].join("\n");
    
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename=attendees-${req.params.id}.csv`);
    res.send(csvContent);
  } catch (error) {
    console.error('CSV export error:', error);
    res.status(500).json({ error: "Failed to export CSV" });
  }
});

app.post("/bookings", async (req: Request, res: Response) => {
  const { room_id, start_time, end_time, resources = [], requested_by } = req.body || {};
  if (!room_id || !start_time || !end_time || !requested_by)
    return res.status(400).json({ error: "Missing fields" });

  const id = randomUUID();
  await db.execute(
    "INSERT INTO bookings (id, room_id, start_time, end_time, resources, status, requested_by) VALUES ($1,$2,$3,$4,$5,$6,$7)",
    [id, room_id, start_time, end_time, JSON.stringify(resources), "pending", requested_by]
  );
  res.status(201).json({ id });
});

app.post("/events", async (req: Request, res: Response) => {
  const {
    title,
    description = "",
    date,
    start_time,
    end_time = null,
    location,
    capacity = null,
    booking_id = null,
    attachments = [],
  } = req.body || {};
  if (!title || !date || !start_time || !location)
    return res.status(400).json({ error: "Missing fields" });

  const id = randomUUID();
  await db.execute(
    "INSERT INTO events (id, title, description, date, start_time, end_time, location, capacity, status, booking_id) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)",
    [id, title, description, date, start_time, end_time, location, capacity, "active", booking_id]
  );

  for (const att of attachments) {
    if (att?.type === "link" && att?.url) {
      await db.execute(
        "INSERT INTO attachments (id, event_id, type, url, name, mime) VALUES ($1,$2,$3,$4,$5,$6)",
        [randomUUID(), id, "link", att.url, att.name || att.url, att.mime || null]
      );
    }
  }

  res.status(201).json({ id });
});

// DELETE event
app.delete("/events/:id", async (req: Request, res: Response) => {
  try {
    await db.execute("DELETE FROM events WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: "Failed to delete event" });
  }
});

// UPDATE event
app.patch("/events/:id", async (req: Request, res: Response) => {
  const { title, description, date, start_time, end_time, location, capacity, booking_id } = req.body;
  
  try {
    await db.execute(
      `UPDATE events SET 
        title = COALESCE($1, title),
        description = COALESCE($2, description),
        date = COALESCE($3, date),
        start_time = COALESCE($4, start_time),
        end_time = COALESCE($5, end_time),
        location = COALESCE($6, location),
        capacity = COALESCE($7, capacity),
        booking_id = COALESCE($8, booking_id)
       WHERE id = $9`,
      [title, description, date, start_time, end_time, location, capacity, booking_id, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: "Failed to update event" });
  }
});

// ADD attendee to event
app.post("/events/:eventId/attendees", async (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!name) return res.status(400).json({ error: "Name is required" });

  try {
    const id = randomUUID();
    await db.execute(
      "INSERT INTO attendees (id, event_id, name, email, checked_in, qr_id) VALUES ($1, $2, $3, $4, $5, $6)",
      [id, req.params.eventId, name, email || null, false, `qr-${Date.now()}`]
    );
    res.status(201).json({ id });
  } catch (error) {
    console.error('Add attendee error:', error);
    res.status(500).json({ error: "Failed to add attendee" });
  }
});

// UPDATE attendee check-in status
app.patch("/attendees/:id/checkin", async (req: Request, res: Response) => {
  const { checked_in } = req.body;
  
  try {
    await db.execute(
      "UPDATE attendees SET checked_in = $1 WHERE id = $2",
      [checked_in, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Update check-in error:', error);
    res.status(500).json({ error: "Failed to update check-in status" });
  }
});

// DELETE attendee
app.delete("/attendees/:id", async (req: Request, res: Response) => {
  try {
    await db.execute("DELETE FROM attendees WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete attendee error:', error);
    res.status(500).json({ error: "Failed to delete attendee" });
  }
});

// DELETE attachment
app.delete("/attachments/:id", async (req: Request, res: Response) => {
  try {
    await db.execute("DELETE FROM attachments WHERE id = $1", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete attachment error:', error);
    res.status(500).json({ error: "Failed to delete attachment" });
  }
});

// UPDATE booking status
app.patch("/bookings/:id/status", async (req: Request, res: Response) => {
  const { status } = req.body;
  if (!['pending', 'approved', 'denied'].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    await db.execute(
      "UPDATE bookings SET status = $1 WHERE id = $2",
      [status, req.params.id]
    );
    res.json({ success: true });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({ error: "Failed to update booking status" });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`CampusConnect API running on :${port}`);
});