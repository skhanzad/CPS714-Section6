import DashboardLayout from "./dashboardlayout";
import PointsCard from "./components/PointsCard";
import EventsSection from "./components/EventsSection";
import RecommendedEventsSection from "./components/ReccomendedEventsSection";

export type EventItem = {
  id: string;
  name: string;
  org: string;
  dateLabel: string;
  dateExact: string;
  location: string;
  status: "RSVP" | "Pending" | "Done";
};

export default async function DashboardPage() {
  const userName = "Dylan Ha";

  // TODO: integrate backend , just have dummy values for now 
  const events: EventItem[] = [
    {
      id: "1",
      name: "Hackathon",
      org: "TMU CSCU",
      dateLabel: "In 2 Days",
      dateExact: "2025/10/11",
      location: "KHW-12",
      status: "RSVP",
    },
    {
      id: "2",
      name: "Homecoming",
      org: "TMU SLC",
      dateLabel: "Today • 5h ago",
      dateExact: "2025/10/09",
      location: "MAC",
      status: "RSVP",
    },
    {
      id: "3",
      name: "Tutoring",
      org: "MUESS",
      dateLabel: "Today • 1h ago",
      dateExact: "2025/10/09",
      location: "ENG203",
      status: "RSVP",
    },
    {
      id: "4",
      name: "Dodgeball",
      org: "TMU Athletics",
      dateLabel: "In 5 Days",
      dateExact: "2025/10/14",
      location: "KHW-LG",
      status: "Pending",
    },
    {
      id: "5",
      name: "Bug Push",
      org: "MUESS",
      dateLabel: "Yesterday • 6:00 PM",
      dateExact: "2025/10/08",
      location: "KHW",
      status: "Done",
    },
    {
      id: "6",
      name: "Resume Roast",
      org: "TMU CSCU",
      dateLabel: "Yesterday • 8:00 PM",
      dateExact: "2025/10/08",
      location: "DCC-208",
      status: "Done",
    },
  ];

  const recommended = events.slice(0, 0); // TODO: integrate backend recommendation logic

  return (
    <DashboardLayout userName={userName} activeRoute="dashboard">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* points + recommended */}
        <div className="space-y-8">
          <PointsCard
            totalPoints={5000}
            cardLastDigits="501056670"
            // TODO: integrate backend – points from Rewards system
          />
          <RecommendedEventsSection events={recommended} />
        </div>

        {/* events */}
        <div className="xl:col-span-2">
          <EventsSection events={events} />
        </div>
      </div>
    </DashboardLayout>
  );
}
