import { getRecommendedEvents } from "./recommendation";
type EventItems = {
  id: string;
  name: string;
  org: string;
  dateLabel: string;
  dateExact: string;
  location: string;
  status: string;
};

describe("getRecommendedEvents", () => {
  test("recommends events from orgs the user attended", () => {
    const dummyEvent: EventItems[] = [
      {
        id: "1",
        name: "Test1",
        org: "Org1",
        dateLabel: "Today",
        dateExact: "2025/11/20",
        location: "ENG206",
        status: "Done"
      },
      {
        id: "2",
        name: "Test2",
        org: "Org1",
        dateLabel: "Today",
        dateExact: "2025/11/20",
        location: "ENG206",
        status: "RSVP",
      },
      {
        id: "3",
        name: "Test3",
        org: "Org3",
        dateLabel: "Today",
        dateExact: "2025/11/20",
        location: "ENG206",
        status: "RSVP",
      }
    ];

    const result = getRecommendedEvents(dummyEvent);

    expect(result).toEqual([ //should only return 2nd test. Org1 is extracted and 2nd event has not done status
      {
        id: "2",
        name: "Test2",
        org: "Org1",
        dateLabel: "Today",
        dateExact: "2025/11/20",
        location: "ENG206",
        status: "RSVP"
      }
    ]);
  });
});
