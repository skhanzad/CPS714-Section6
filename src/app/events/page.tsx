import { getCurrentUser } from "@/app/lib/getCurrentUser";
import EventsContent from "./EventsContent";

export default async function EventsPage() {
  const user = await getCurrentUser();
  const userId = user?.id ?? null;

  return <EventsContent userId={userId} />;
}
