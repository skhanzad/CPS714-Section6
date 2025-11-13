import type { EventItem } from "../page";

type RecommendedEventsSectionProps = {
  events: EventItem[];
};

export default function RecommendedEventsSection({
  events,
}: RecommendedEventsSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow p-6">
      <h2 className="text-lg font-semibold mb-4">Recommended Events</h2>

      <div className="space-y-4">
        {events.map((ev) => (
          <div key={ev.id} className="pb-3 border-b last:border-0 last:pb-0">
            <div className="font-medium">{ev.name}</div>
            <div className="text-xs text-gray-500">{ev.org}</div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{ev.dateLabel}</span>
              <span>{ev.location}</span>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-sm text-gray-500">
            No recommendations yet. {/* TODO: integrate backend recommendation logic */}
          </p>
        )}
      </div>
    </div>
  );
}
