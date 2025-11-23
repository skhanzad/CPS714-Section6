import { getRecommendedEvents } from "./recommendation";
type UserItems = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  student_id: string;
  password: string;
  permission_level: number;
  attended_events: string[];
  interested_events: string[];
  points: number;
};

type EventItems = {
  id: string;
  names: string;
  org: string;
  dateexact: string;
  locations: string;
  currstatus: "done" | "pending";
};

describe("getRecommendedEvents", () => {
  test("recommends events from orgs the user attended", () => {
    const events: EventItems[] = [
      {
        id: "1",
        names: "Test Event 1",
        org: "Org1",
        dateexact: "2025/11/20",
        locations: "ENG206",
        currstatus: "done", // already attended
      },
      {
        id: "2",
        names: "Test Event 2",
        org: "Org1",
        dateexact: "2025/11/21",
        locations: "ENG207",
        currstatus: "pending", // upcoming
      },
      {
        id: "3",
        names: "Test Event 3",
        org: "Org2",
        dateexact: "2025/11/22",
        locations: "ENG208",
        currstatus: "pending",
      },
    ];

    const dummyUser: UserItems = {
      id: "u1",
      first_name: "Jimmy",
      last_name: "Fang",
      email: "jimmy@example.com",
      student_id: "S1234567",
      password: "password123",
      permission_level: 0,
      attended_events: ["1"], // already attended Event 1
      interested_events: ["3"],
      points: 5000,
    };

    const result = getRecommendedEvents(events, dummyUser);

    expect(result).toEqual([
      {
        id: "2",
        names: "Test Event 2",
        org: "Org1",
        dateexact: "2025/11/21",
        locations: "ENG207",
        currstatus: "pending",
      },
      {
        id: "3",
        names: "Test Event 3",
        org: "Org2",
        dateexact: "2025/11/22",
        locations: "ENG208",
        currstatus: "pending",
      },
    ]);
  });

  test("includes interested events even if org not attended before", () => {
    const events: EventItems[] = [
      {
        id: "1",
        names: "Test Event 1",
        org: "Org1",
        dateexact: "2025/11/20",
        locations: "ENG206",
        currstatus: "done",
      },
      {
        id: "2",
        names: "Test Event 2",
        org: "Org2",
        dateexact: "2025/11/21",
        locations: "ENG207",
        currstatus: "pending",
      },
    ];

    const dummyUser: UserItems = {
      id: "u1",
      first_name: "Jimmy",
      last_name: "Fang",
      email: "jimmy@example.com",
      student_id: "S1234567",
      password: "password123",
      permission_level: 0,
      attended_events: ["1"],
      interested_events: ["2"], // interested in Event 2
      points: 5000,
    };

    const result = getRecommendedEvents(events, dummyUser);

    expect(result).toEqual([
      {
        id: "2",
        names: "Test Event 2",
        org: "Org2",
        dateexact: "2025/11/21",
        locations: "ENG207",
        currstatus: "pending",
      },
    ]);
  });
});

