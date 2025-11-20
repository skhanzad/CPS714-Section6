"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EventCard from "../components/EventCard";
import FilterPanel from "../components/FilterPanel";
import CalendarView from "../components/CalendarView";
import { events as allEvents } from "../data/events"; // import events from data.js

export default function StaffDashboard() {
  const router = useRouter();

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    categories: ["Meeting", "Orientation", "Workshop", "Social"],
    from: "",
    to: "",
  });

  const [showAvailableOnly, setShowAvailableOnly] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);


  // Load events from data.js
  useEffect(() => {
    setEvents(allEvents);
  }, []);

  // Filter logic
  const filteredEvents = events.filter((e) => {
    const matchSearch =
      e.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      e.description.toLowerCase().includes(filters.search.toLowerCase());

    const matchCategory = filters.categories.includes(e.category);

    const matchFrom = filters.from ? new Date(e.date) >= new Date(filters.from) : true;
    const matchTo = filters.to ? new Date(e.date) <= new Date(filters.to) : true;

    const availableSeats = parseInt(e.seats.split(";")[1].split(" ")[1]);
    const matchAvailable = showAvailableOnly ? availableSeats > 0 : true;

    return matchSearch && matchCategory && matchFrom && matchTo && matchAvailable;
  });

  // Staff actions
  const handleEdit = (id) => alert(`Edit event ${id}`);
  const handleCancel = (id) => alert(`Cancel event ${id}`);
  const handleViewAttendance = (id) => alert(`View attendance for event ${id}`);

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      {/* Header */}
      <header className="bg-white shadow flex justify-between items-center px-8 py-4 border-b">
        <div className="flex items-center space-x-3">
          <img src="/tmulogo.jpg" alt="TMU Logo" className="w-12 h-12 object-contain" />
          <h1 className="text-2xl font-bold text-[#004C9B]">Staff Dashboard</h1>
        </div>
        <button
          onClick={() => router.push("/events")}
          className="text-blue-700 font-semibold hover:underline"
        >
          View Public Events
        </button>
      </header>

      <main className="p-10 flex gap-8">
        {/* Left: Event list */}
        <div className="flex-1 space-y-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onEdit={handleEdit}
              onCancel={handleCancel}
              onViewAttendance={handleViewAttendance}
              isAvailable={parseInt(event.seats.split(";")[1].split(" ")[1]) > 0}
              onSelect={() => setSelectedEvent(event)}
              isSelected={selectedEvent?.id === event.id}
            />
          ))}
        </div>

        {/* Right: Filter + Calendar */}
        <div className="flex flex-col gap-5 sticky top-10 self-start">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            showAvailableOnly={showAvailableOnly}
            setShowAvailableOnly={setShowAvailableOnly} 
          />

          {/* Calendar preview */}
          <div
            className="h-[145px] w-80 border rounded-lg bg-white overflow-auto cursor-pointer"
            onClick={() => router.push("/events/calendar")}
          >
            <CalendarView events={events} />
          </div>
        </div>
      </main>
    </div>
  );
}
