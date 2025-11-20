"use client";

import { Calendar, Clock, MapPin, User, CircleDollarSign, Smile, CalendarPlus, Bell, Star } from "lucide-react";
import { useState } from "react";

export default function DetailsPanel({ event, isAvailable }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [notifs, setNotifs] = useState(false);
  const [calendar, setCalendar] = useState(false);

  const handleStarClick = () => setBookmarked(!bookmarked);
  const handleBellClick = () => setNotifs(!notifs);
  const handleCalendarClick = () => setCalendar(!calendar);

  if (!event) {
    return (
      <div className="bg-white border shadow-sm rounded-md p-5 min-w-[20rem] min-h-[40rem] flex items-center justify-center">
        <div className="text-gray-700 text-sm text-center max-w-[10rem]">
          Select an event to view its details here.
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border shadow-sm rounded-md p-5 min-w-[20rem] min-h-[40rem] flex flex-col">
      {/* Make this div take full height */}
      <div className="flex flex-col justify-between flex-grow">
        {/* Top section */}
        <div>
          <div className="text-2xl font-bold text-[#004C9B]">{event.title}</div>
          <div className="h-0.5 mt-4 mb-4 bg-[#004C9B]"></div>

          <div className="text-gray-700 mt-2 mb-4 text-sm">{event.description}</div>

          <div className="grid grid-cols-1 gap-x-3 gap-y-2 text-sm text-gray-700 mt-3">
            <div className="flex items-center gap-2">
              <Calendar size={15} className="text-[#004C9B]" /> {event.date}
            </div>
            <div className="flex items-center gap-2">
              <Clock size={15} className="text-[#004C9B]" /> {event.time}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={15} className="text-[#004C9B]" /> {event.location}
            </div>
            <div className="flex items-center gap-2">
              <User size={15} className="text-[#004C9B]" /> {event.staff}
            </div>
            <div className="flex items-center gap-2">
              <CircleDollarSign size={15} className="text-[#004C9B]" /> {event.price}
            </div>
            <div className="flex items-center gap-2">
              <Smile size={15} className="text-[#004C9B]" /> {event.seats}
            </div>
          </div>
        </div>

        {/* Bottom section (buttons) */}
        <div className="flex flex-col justify-start gap-2 mt-6">
        {isAvailable ? (
            <button
            onClick={handleCalendarClick}
            className="p-1 flex items-center gap-4"
            title="Add to calendar"
            >
            <CalendarPlus
                size={35}
                className={`transition ${
                calendar ? "fill-[#004C9B] stroke-[#004C9B]" : "text-[#004C9B]"
                }`}
            />
            <span className="text-lg text-[#004C9B] font-medium">Register now!</span>
            </button>
        ) : (
            <button
            onClick={handleBellClick}
            className="p-1 flex items-center gap-4"
            title="Notify me"
            >
            <Bell
                size={35}
                className={`transition ${
                notifs ? "fill-[#004C9B] stroke-[#004C9B]" : "text-[#004C9B]"
                }`}
            />
            <span className="text-lg text-[#004C9B] font-medium">Notify me when available</span>
            </button>
        )}

        <button
            onClick={handleStarClick}
            className="p-1 flex items-center gap-4"
            title="Bookmark event"
        >
            <Star
            size={35}
            className={`transition ${
                bookmarked
                ? "fill-yellow-400 stroke-yellow-400"
                : "text-yellow-400"
            }`}
            />
            <span className="text-lg text-yellow-500 font-medium">Bookmark this event</span>
        </button>
        </div>
      </div>
    </div>
  );
}
