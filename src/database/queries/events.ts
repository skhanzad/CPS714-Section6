import { lt, isNull, or } from "drizzle-orm";
import { db } from "../connection";
import { eventsTable } from "../schema";

export const listEventsWithCapacity = async () => {
  const availableEvents = await db
    .select()
    .from(eventsTable)
    .where(
      or(
        isNull(eventsTable.capacity),
        lt(eventsTable.rsvpCount, eventsTable.capacity)
      )
    );

  return availableEvents;
};