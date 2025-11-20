"use client";
import { useState } from "react";
import { events } from "../../data/events";

export default function EventCalendarPage() {
  const [view, setView] = useState("month"); // "month" | "week" | "day"
  const today = new Date();

  // Helper to get start and end of the current week (Sunday → Saturday)
  const getWeekRange = (date) => {
    const day = date.getDay(); // 0 (Sun) - 6 (Sat)
    const start = new Date(date);
    start.setDate(date.getDate() - day); // Sunday
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(start.getDate() + 6); // Saturday
    end.setHours(23, 59, 59, 999);

    return { start, end };
  };

  const eventsToShow = events.filter((e) => {
    const eventDate = new Date(e.date);

    if (view === "day") {
      return e.date === today.toISOString().split("T")[0];
    } else if (view === "week") {
      const { start, end } = getWeekRange(today);
      return eventDate >= start && eventDate <= end;
    } 
    // month view just return all for now
    return true;
  });

  return (
    <div className="p-10">
      {/* View buttons */}
      <div className="flex gap-2 mb-5">
        <button 
          onClick={() => setView("day")} 
          className="bg-[#09529D] text-white px-3 py-1 border rounded hover:bg-blue-600"
        >
          Day
        </button>
        <button 
          onClick={() => setView("week")} 
          className="bg-[#09529D] text-white px-3 py-1 border rounded hover:bg-blue-600"
        >
          Week
        </button>
        <button 
          onClick={() => setView("month")} 
          className="bg-[#09529D] text-white px-3 py-1 border rounded hover:bg-blue-600"
        >
          Month
        </button>
      </div>

      {/* Events list */}
      <div className="space-y-4">
        {eventsToShow.length === 0 ? (
          <p className="text-gray-500">No events in this {view} view.</p>
        ) : (
          eventsToShow.map((event) => (
            <div key={event.id} className={`p-4 border rounded ${event.color}`}>
              <h3 className="font-bold text-lg">{event.title}</h3>
              <p>{event.description}</p>
              <p>{event.date} | {event.time} | {event.location}</p>
              <p>Staff: {event.staff} | Seats: {event.seats} | Price: {event.price}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
