'use client';

import EventForm from "../../../components/events/EventForm";
import Header from "../../../components/Header"

export default function EventsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-6">
        <EventForm />
      </main>
    </div>
  );
}