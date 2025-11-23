"use client"; // ← must be first line

import DashboardLayout from "./dashboardlayout";
import PointsCard from "./components/PointsCard";
import EventsSection from "./components/EventsSection";
import RecommendedEventsSection from "./components/ReccomendedEventsSection";
import RecommendedEventsContainer from "./components/RecommendedEventsContainer";
import { useEffect, useState } from "react";

export type UserItem = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id: string;
  password: string;
  permission_level: number;
  attended_events: string[];
  interested_events: string[];
  points: number;
};

export type EventItem = {
  id: string;
  names: string;
  org: string;
  dateexact: string;
  locations: string;
  currstatus: string;
};

export default function DashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Failed to fetch events:", err));
  }, []);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data: UserItem[]) => {
        setUsers(data);
        // Filter for Jimmy Fang
        const jimmy = data.find(u => u.first_name === "Jimmy" && u.last_name === "Fang") || null;
        setCurrentUser(jimmy);
      })
      .catch((err) => console.error("Failed to fetch users:", err));
  }, []);


  return (
    <DashboardLayout userName={`${currentUser?.first_name} ${currentUser?.last_name}`} activeRoute="dashboard">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="space-y-8">
          <PointsCard
            totalPoints={currentUser?.points ?? 0}
            cardLastDigits={currentUser?.student_id.slice(-4) ?? "0000"}
          />
          <RecommendedEventsContainer events={events} currentUser = {currentUser}/>
        </div>

        <div className="xl:col-span-2">
          <EventsSection events={events} />
        </div>
      </div>
    </DashboardLayout>
  );
}
