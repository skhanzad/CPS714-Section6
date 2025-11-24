"use client";
import DashboardLayout from "../dashboardlayout";
import { useEffect, useState } from "react";
import type { EventItem, UserItem } from "../page";

type AttendedEvent = {
  id: string;
  name: string;
  org: string;
  dateExact: string;
  location: string;
};

export default function HistoryPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((users: UserItem[]) => {
        const currentusr = users.find(
          (u) => u.first_name === "Jimmy" && u.last_name === "Fang" // change to dylan ha if you want to switch users to view history 
        );
        if (currentusr) {
          setCurrentUser(currentusr);  

          // fetch all events
          fetch("/api/events")
            .then((res) => res.json())
            .then((events: EventItem[]) => {
              
              // filter events that user attended
              const attended = events.filter((ev) =>
                currentusr.attended_events.includes(ev.id)
              );
              setEvents(attended);
            });
        }
      })
      .catch((err) => console.error("Failed to fetch data:", err));
  }, []);


  return (
    <DashboardLayout userName={`${currentUser?.first_name} ${currentUser?.last_name}`} activeRoute="history">
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4 text-black">Event History</h2>
        <p className="text-sm text-gray-500 mb-4">
          Events you&apos;ve attended.
        </p>

        {events.length === 0 ? (
          <p className="text-sm text-gray-500">
            You haven&apos;t attended any events yet.
          </p>
        ) : (
          <ul className="divide-y">
            {events.map((ev) => (
              <li key={ev.id} className="py-3 flex justify-between">
                <div>
                  <div className="font-medium text-black">{ev.names}</div>
                  <div className="text-xs text-gray-500">{ev.org}</div>
                  <div className="text-xs text-gray-400">{ev.dateexact}</div>
                </div>
                <div className="text-xs text-gray-500">{ev.locations}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
