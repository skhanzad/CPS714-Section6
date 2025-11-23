import type { EventItem } from "../page";

export function getRecommendedEvents(events: EventItem[]) { //Recommend events from the same orgs the user attended recently
  const pastOrgs = [...new Set( //Set ensures unique events onlyt, 
    events
      .filter(ev => ev.currstatus === "Done")   //only look at events user attended
      .map(ev => ev.org))]; //Extract org name of these events

  return events.filter(ev => pastOrgs.includes(ev.org) && ev.currstatus !== "Done"); 
}//filter ev yet again, we only want events that are upcoming 
