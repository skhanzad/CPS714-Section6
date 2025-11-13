import DashboardLayout from "../dashboardlayout";

type AttendedEvent = {
  id: string;
  name: string;
  org: string;
  dateExact: string;
  location: string;
};

export default async function HistoryPage() {
  // TODO: integrate backend – fetch list of events user has attended, just have dummy values rn
  const attendedEvents: AttendedEvent[] = [
    {
      id: "1",
      name: "Bug Push",
      org: "MUESS",
      dateExact: "2025/10/08 • 06:00 PM",
      location: "KHW",
    },
    {
      id: "2",
      name: "Resume Roast",
      org: "TMU CSCU",
      dateExact: "2025/10/08 • 08:00 PM",
      location: "DCC-208",
    },
  ];

  return (
    <DashboardLayout userName="Dylan Ha" activeRoute="history">
      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Event History</h2>
        <p className="text-sm text-gray-500 mb-4">
          Events you&apos;ve attended.
        </p>

        {attendedEvents.length === 0 ? (
          <p className="text-sm text-gray-500">
            You haven&apos;t attended any events yet.
          </p>
        ) : (
          <ul className="divide-y">
            {attendedEvents.map((ev) => (
              <li key={ev.id} className="py-3 flex justify-between">
                <div>
                  <div className="font-medium">{ev.name}</div>
                  <div className="text-xs text-gray-500">{ev.org}</div>
                  <div className="text-xs text-gray-400">{ev.dateExact}</div>
                </div>
                <div className="text-xs text-gray-500">{ev.location}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
