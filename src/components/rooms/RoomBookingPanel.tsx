import { useState, useMemo, useEffect } from "react";

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

type BookingStatus = "pending" | "approved" | "denied";

export default function RoomBookingPanel() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [roomId, setRoomId] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedResources, setSelectedResources] = useState<string[]>([]);
  const [requestedBy, setRequestedBy] = useState("Organizer");

  // Fetch data from your Express server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, resourcesRes, bookingsRes] = await Promise.all([
          fetch('http://localhost:3001/rooms'),
          fetch('http://localhost:3001/resources'),
          fetch('http://localhost:3001/bookings')
        ]);

        const roomsData = await roomsRes.json();
        const resourcesData = await resourcesRes.json();
        const bookingsData = await bookingsRes.json();

        setRooms(roomsData);
        setResources(resourcesData);
        setBookings(bookingsData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  const isoStart = useMemo(
    () => (date && startTime ? `${date}T${startTime}:00` : ""),
    [date, startTime]
  );
  const isoEnd = useMemo(
    () => (date && endTime ? `${date}T${endTime}:00` : ""),
    [date, endTime]
  );

  const overlaps = useMemo(() => {
    if (!roomId || !isoStart || !isoEnd) return false;
    return bookings.some(
      (bk) =>
        bk.room_id === roomId &&
        !(bk.end_time <= isoStart || bk.start_time >= isoEnd)
    );
  }, [bookings, roomId, isoStart, isoEnd]);

  const addBooking = async (bookingData: {
    roomId: string;
    startTime: string;
    endTime: string;
    resources: string[];
    requestedBy: string;
  }) => {
    try {
      const response = await fetch('http://localhost:3001/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          room_id: bookingData.roomId,
          start_time: bookingData.startTime,
          end_time: bookingData.endTime,
          resources: bookingData.resources,
          requested_by: bookingData.requestedBy
        }),
      });

      if (response.ok) {
        const newBooking = await response.json();
        // Refresh bookings to include the new one
        const bookingsRes = await fetch('http://localhost:3001/bookings');
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
        return newBooking;
      }
    } catch (error) {
      console.error('Failed to create booking:', error);
    }
  };

  const setBookingStatus = async (id: string, status: BookingStatus) => {
    try {
      const response = await fetch(`http://localhost:3001/bookings/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        // Refresh bookings to get updated status
        const bookingsRes = await fetch('http://localhost:3001/bookings');
        const bookingsData = await bookingsRes.json();
        setBookings(bookingsData);
      }
    } catch (error) {
      console.error('Failed to update booking status:', error);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId || !isoStart || !isoEnd) return;
    
    await addBooking({
      roomId,
      startTime: isoStart,
      endTime: isoEnd,
      resources: selectedResources,
      requestedBy,
    });
    
    // reset form
    setRoomId("");
    setDate("");
    setStartTime("");
    setEndTime("");
    setSelectedResources([]);
  };

  const toggleRes = (id: string) => {
    setSelectedResources((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const changeStatus = (id: string, status: BookingStatus) => {
    setBookingStatus(id, status);
  };

  return (
    <div className="bg-white/80 border border-black/10 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4 text-black">
        Room & Resource Booking (Subproject 9)
      </h2>
      <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={submit}>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-black/70">Room</span>
          <select
            className="border rounded px-3 py-2"
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
            className="border rounded px-3 py-2"
            value={requestedBy}
            onChange={(e) => setRequestedBy(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-black/70">Date</span>
          <input
            type="date"
            className="border rounded px-3 py-2"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm text-black/70">Start Time</span>
            <input
              type="time"
              className="border rounded px-3 py-2"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm text-black/70">End Time</span>
            <input
              type="time"
              className="border rounded px-3 py-2"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </label>
        </div>

        <div className="md:col-span-2">
          <span className="text-sm text-black/70">Resources</span>
          <div className="flex flex-wrap gap-3 mt-2">
            {resources.map((res) => (
              <label key={res.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selectedResources.includes(res.id)}
                  onChange={() => toggleRes(res.id)}
                />
                <span className="text-black">{res.name}</span>
              </label>
            ))}
          </div>
        </div>

        {overlaps && (
          <div className="md:col-span-2 text-sm text-amber-700 bg-amber-100 border border-amber-200 rounded p-2">
            Warning: This booking overlaps with an existing booking for the
            selected room.
          </div>
        )}

        <div className="md:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            className="bg-black text-white rounded px-4 py-2 hover:bg-black/80 transition"
          >
            Request Booking
          </button>
        </div>
      </form>

      <BookingList 
        bookings={bookings} 
        rooms={rooms}
        resources={resources}
        onChangeStatus={changeStatus} 
      />
    </div>
  );
}

function BookingList({
  bookings,
  rooms,
  resources,
  onChangeStatus,
}: {
  bookings: Booking[];
  rooms: Room[];
  resources: Resource[];
  onChangeStatus: (id: string, status: BookingStatus) => void;
}) {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-black mb-2">Bookings</h3>
      <div className="space-y-2">
        {bookings.length === 0 && (
          <p className="text-black/60">No bookings yet. Create one above.</p>
        )}
        {bookings.map((bk) => {
          const roomName = rooms.find((r) => r.id === bk.room_id)?.name;
          const resNames = bk.resources
            .map((rid) => resources.find((r) => r.id === rid)?.name || rid)
            .join(", ");
          return (
            <div
              key={bk.id}
              className="border border-black/10 rounded p-3 bg-white/60"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-black">
                    {roomName}{" "}
                    <span className="text-xs text-black/60">({bk.status})</span>
                  </p>
                  <p className="text-sm text-black/70">
                    {new Date(bk.start_time).toLocaleString()} -{" "}
                    {new Date(bk.end_time).toLocaleString()}
                  </p>
                  {resNames && (
                    <p className="text-sm text-black/70">
                      Resources: {resNames}
                    </p>
                  )}
                  <p className="text-sm text-black/70">
                    Requested by: {bk.requested_by}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => onChangeStatus(bk.id, "approved")}
                    className="text-green-700 hover:text-green-800"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => onChangeStatus(bk.id, "denied")}
                    className="text-red-700 hover:text-red-800"
                  >
                    Deny
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}