"use client";

import { Calendar, Clock, MapPin, User, CircleDollarSign, Smile, CalendarPlus, Bell, Star } from "lucide-react";
import { useState, useRef } from "react";

export default function EventCard({ event, onEdit, onCancel, onViewAttendance, isAvailable, onSelect, isSelected }) {
  const [bookmarked, setBookmarked] = useState(false);
  const [notifs, setNotifs] = useState(false);
  const [calendar, setCalendar] = useState(false);
  const cardRef = useRef(null);

  const handleCardClick = () => {
    onSelect(event);
  };

  //update click handlers later. need them to perform actual functions
  const handleStarClick = () => {
    setBookmarked(!bookmarked);
  };
  const handleBellClick = () => {
    setNotifs(!notifs);
  };
  const handleCalendarClick = () => {
    setCalendar(!calendar); 
  }

  return (
    <div 
      ref={cardRef} 
      onClick={handleCardClick}
      className={`bg-white border shadow-sm rounded-md p-5 transition cursor-pointer ${
        isSelected
          ? "border-[#0077C8]"
          : "hover:shadow-md"
      }`}>
      <div className="flex justify-between items-start">
        <h2
          className={`text-lg font-bold transition ${
            isSelected ? "text-[#0077C8]" : "text-[#004C9B]"
          }`}
        >{event.title}</h2>
        <div className="flex space-x-2 ">
          {/* Only show bells/stars for public events */}
            {!onEdit && (
            isAvailable ? (
              <button
                onClick={handleCalendarClick}
                className="p-1"
                title="Add to calendar"
              >
                <CalendarPlus
                  size={25}
                  className={`transition ${
                    calendar ? "fill-[#004C9B] stroke-[#004C9B]" : "text-[#004C9B]"
                  }`} />
              </button>
            ) : (
              <button
                onClick={handleBellClick}
                className="p-1"
                title="Notify me"
              >
                <Bell
                  size={25}
                  className={`transition ${
                    notifs ? "fill-[#004C9B] stroke-[#004C9B]" : "text-[#004C9B]"
                  }`}
                />
              </button>
            )
          )}

          {!onEdit && (
            <button
              onClick={handleStarClick}
              className="p-1"
              title="Bookmark event"
            >
              <Star
                size={25}
                className={`transition ${
                  bookmarked ? "fill-yellow-400 stroke-yellow-400" : "text-yellow-400"
                }`}
              />
            </button>
          )}
        </div>
      </div>
      <div
        className={`h-0.5 mt-2 mb-3 transition ${
          isSelected ? "bg-[#0077C8]" : "bg-[#004C9B]"
        }`}
      ></div>

      <div className="text-gray-700 mt-2 text-sm">
        {event.description.length > 150 ? event.description.slice(0, 150) + "..." : event.description}
      </div>

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm text-gray-700 mt-3">
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

      <div className="mt-3">
        <span
          className={`${event.color} text-sm px-3 py-1 rounded-full text-gray-800 font-semibold`}
        >
          {event.category}
        </span>
      </div>

      {onEdit && (
        <div className="mt-3 flex space-x-2">
          <button
            onClick={() => onEdit(event.id)}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Edit
          </button>
          <button
            onClick={() => onCancel(event.id)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => onViewAttendance(event.id)}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-sm"
          >
            Attendance
          </button>
        </div>
      )}
    </div>
  );
}
