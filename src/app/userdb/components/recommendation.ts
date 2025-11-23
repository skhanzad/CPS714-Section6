import type { EventItem , UserItem} from "../page";

export function getRecommendedEvents(events: EventItem[], currentUser: UserItem | null) { //Recommend events from the same orgs the user attended recently
  if(!currentUser) return [];
  const pastOrgs = [...new Set( //Set ensures unique events onlyt, 
    events
      .filter(ev => ev.currstatus === "done") //only look at events user attended
      .map(ev => ev.org))]; //Extract org name of these events
  return events.filter(ev => (pastOrgs.includes(ev.org) && ev.currstatus !== "done") || (currentUser.interested_events.includes(ev.id))); 
}//filter ev yet again, we only want events that are upcoming

