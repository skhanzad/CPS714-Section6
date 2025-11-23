"use client"; // ← must be first line

import DashboardLayout from "./dashboardlayout";
import PointsCard from "./components/PointsCard";
import EventsSection from "./components/EventsSection";
import RecommendedEventsSection from "./components/ReccomendedEventsSection";
import RecommendedEventsContainer from "./components/RecommendedEventsContainer";
import { useEffect, useState } from "react";

export type EventItem = {
  id: string;
  names: string;
  org: string;
  dateexact: string;
  locations: string;
  currstatus: string;
};

export default function DashboardPage() {
  const userName = "Dylan Ha";
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => setEvents(data))
      .catch((err) => console.error("Failed to fetch events:", err));
  }, []);

  const recommended = events.slice(0, 0); // TODO: integrate backend recommendation logic

  return (
    <DashboardLayout userName={userName} activeRoute="dashboard">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="space-y-8">
          <PointsCard
            totalPoints={5000}
            cardLastDigits="501056670"
          />
          <RecommendedEventsContainer events={events} />
        </div>

        <div className="xl:col-span-2">
          <EventsSection events={events} />
        </div>
      </div>
    </DashboardLayout>
  );
}
