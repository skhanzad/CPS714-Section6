"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import EventCard from "../../components/EventCard";
import { events } from "../../data/events";

export default function MyEventsPage() {
  const router = useRouter();
  const pathname = usePathname();

  const [myEvents, setMyEvents] = useState(events.filter(e => e.id % 2 === 0)); // example
  const [selectedEvent, setSelectedEvent] = useState(null);


  return (
    <div className="min-h-screen bg-[#F2F2F2]">
      {/* Header */}
      <header className="bg-white shadow flex justify-between items-center px-8 py-4 border-b mb-6">
        <div className="flex items-center space-x-3">
          <img src="/tmulogo.jpg" alt="TMU Logo" className="w-12 h-12 object-contain" />
          <h1 className="text-2xl font-bold text-[#004C9B]">CampusConnect</h1>
        </div>

        {/* Buttons at the end */}
        <div className="flex space-x-6 text-[#004C9B]">
          <button 
            onClick={() => router.push("/events/myevents")}
            className={`font-medium hover:underline ${
              pathname === "/events/myevents" ? "border-b-4 border-yellow-400 text-yellow-600" : ""
            }`}
          >
            My Events
          </button>
          <button 
            onClick={() => router.push("/events")}
            className={`font-medium hover:underline ${
              pathname === "/events" ? "border-b-4 border-yellow-400 text-yellow-600" : ""
            }`}
          >
            Search Events
          </button>
        </div>
      </header>

      {/* Event list */}
      {myEvents.length === 0 ? (
        <p className="text-gray-700">You are not signed up for any events yet.</p>
      ) : (
        <div className="space-y-6">
          {myEvents.map((event) => (
            <EventCard 
              key={event.id} 
              event={event} 
              isAvailable={parseInt(event.seats.split(";")[1].split(" ")[1]) > 0}
              onSelect={() => setSelectedEvent(event)}
              isSelected={selectedEvent?.id === event.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
