"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import EventCard from "../components/EventCard";
import FilterPanel from "../components/FilterPanel";
import CalendarView from "../components/CalendarView";
import { events as allEvents } from "../data/events";
import DetailsPanel from "../components/DetailsPanel";

export default function EventsPage() {
  const router = useRouter();

  // Filters state
  const [filters, setFilters] = useState({
    search: "",
    categories: ["Academics", "Sports", "Social"],
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

  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      {/* Header */}
      <header className="bg-white shadow flex justify-between items-center px-8 py-4 border-b">
        <div className="flex items-center space-x-3">
          <img src="/tmulogo.jpg" alt="TMU Logo" className="w-12 h-12 object-contain" />
          <h1 className="text-2xl font-bold text-[#004C9B]">CampusConnect</h1>
        </div>

        {/* My Events / Search Events buttons */}
        <div className="flex space-x-6 text-[#004C9B]">
          <button
            onClick={() => router.push("/events/myevents")}
            className="hover:underline font-medium"
          >
            My Events
          </button>
          <button
            onClick={() => router.push("/events")}
            className="border-b-4 border-yellow-400 font-semibold text-yellow-600"
          >
            Search Events
          </button>
        </div>
      </header>

      <main className="p-10 flex gap-8">
        {/* Left column: events */}
        <div className="flex-1 space-y-6">
          {filteredEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              isAvailable={parseInt(event.seats.split(";")[1].split(" ")[1]) > 0}
              onSelect={() => setSelectedEvent(event)}
              isSelected={selectedEvent?.id === event.id}
            />
          ))}
        </div>

        {/*Middle column: details panel */}
        <div className="sticky top-10 self-start">
          <DetailsPanel
            event={selectedEvent}
            isAvailable={
              selectedEvent
                ? parseInt(selectedEvent.seats?.split(";")[1]?.split(" ")[1]) > 0
                : false
            }
          />
        </div>

        {/* Right column: filter panel + calendar preview */}
        <div className="flex flex-col gap-5 sticky top-10 self-start">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            showAvailableOnly={showAvailableOnly}
            setShowAvailableOnly={setShowAvailableOnly}
          />

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
