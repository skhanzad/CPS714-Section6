// src/components/CalendarView.js
import { Calendar } from "lucide-react";

export default function CalendarView() {
  return (
    <div className="p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-semibold text-blue-700 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" /> Event Calendar
      </h3>
      <p className="text-gray-600">
        📅 Calendar view will appear here (daily, weekly, or monthly).
      </p>
    </div>
  );
}
