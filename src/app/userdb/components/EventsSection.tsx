"use client";

import { useMemo, useState } from "react";
import type { EventItem } from "../page";

type EventsSectionProps = {
  events: EventItem[];
};

const PAGE_SIZE = 4;

export default function EventsSection({ events }: EventsSectionProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAll, setShowAll] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.dateExact).getTime();
      const dateB = new Date(b.dateExact).getTime();

      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });
  }, [events, sortOrder]);

  const totalPages = Math.ceil(sortedEvents.length / PAGE_SIZE);

  const visibleEvents = useMemo(() => {
    if (showAll) return sortedEvents;
    const start = (currentPage - 1) * PAGE_SIZE;
    return sortedEvents.slice(start, start + PAGE_SIZE);
  }, [sortedEvents, currentPage, showAll]);

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((p) => p + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((p) => p - 1);
  };

  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h2 className="text-lg font-semibold">Events</h2>

        <div className="flex items-center gap-3 text-sm">
          <span className="text-gray-500 mr-1">Sort by</span>
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="font-medium text-blue-600 flex items-center gap-1"
          >
            Date
            <span className="text-xs">
              {sortOrder === "asc" ? "▲" : "▼"}
            </span>
          </button>
        </div>
      </div>

      {/* table to display events */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-gray-500 border-b">
              <th className="py-2">Event</th>
              <th>Date</th>
              <th>Location</th>
              <th className="text-right pr-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {visibleEvents.map((ev) => (
              <tr key={ev.id} className="border-b last:border-0 hover:bg-gray-50 transition">
                <td className="py-3">
                  <div className="font-medium">{ev.name}</div>
                  <div className="text-xs text-gray-500">{ev.org}</div>
                </td>
                <td>
                  <div>{ev.dateLabel}</div>
                  <div className="text-xs text-gray-500">{ev.dateExact}</div>
                </td>
                <td>{ev.location}</td>
                <td className="text-right pr-2">
                  {ev.status === "RSVP" && (
                    <button className="text-blue-600 font-medium text-xs">RSVP</button>
                  )}
                  {ev.status === "Pending" && (
                    <span className="text-yellow-500 text-xs font-medium">Pending</span>
                  )}
                  {ev.status === "Done" && (
                    <span className="text-green-600 text-xs font-medium">Done</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-sm">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1 || showAll}
            className="px-2 py-1 border rounded disabled:opacity-40"
          >
            Prev
          </button>
          <button
            onClick={handleNext}
            disabled={currentPage === totalPages || showAll}
            className="px-2 py-1 border rounded disabled:opacity-40"
          >
            Next
          </button>
          {!showAll && (
            <span className="text-gray-500 ml-2">
              Page {currentPage} of {Math.max(totalPages, 1)}
            </span>
          )}
        </div>

        <button
          onClick={() => setShowAll((v) => !v)}
          className="text-blue-600 font-medium flex items-center gap-1 self-start md:self-auto"
        >
          {showAll ? "Show Less" : "Show All My Events"}
          <span className="text-xs">{showAll ? "▲" : "▼"}</span>
        </button>
      </div>
    </div>
  );
}
