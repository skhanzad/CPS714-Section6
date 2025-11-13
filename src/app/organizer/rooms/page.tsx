'use client';

import RoomBookingPanel from "../../../components/rooms/RoomBookingPanel"
import Header from "../../../components/Header"

export default function RoomsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto p-6">
        <RoomBookingPanel />
      </main>
    </div>
  );
}