/**
 * @jest-environment node
 */
import { POST, GET, DELETE } from "@/app/api/rsvp/[id]/route";
import getDb from "@/auth/db";
import { NextResponse } from "next/server";

jest.mock("@/auth/db");
jest.mock("next/server");

const mockQuery = jest.fn();
(getDb as jest.Mock).mockResolvedValue({ query: mockQuery });

const mockReq = (body: any = {}) =>
  new Request("http://localhost", {
    method: "POST",
    body: JSON.stringify(body),
  });

const mockContext = (params: any) => ({ params });

beforeEach(() => {
  mockQuery.mockReset();
});
beforeAll(() => {
  jest.spyOn(console, "error").mockImplementation(() => {});
});
//
// ───────────────────────────────────────────────────────────────
//   POST TESTS
// ───────────────────────────────────────────────────────────────
//
describe("POST /api/rsvps/[id]", () => {

  test("returns 404 if event not found", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });

    const res = await POST(mockReq({ userId: 1 }), mockContext({ id: 10 }));

    expect(res.body).toStrictEqual({error: "Event does not exist"});
    expect(res.status).toBe(404);

  });

  test("RSVP limited event (success)", async () => {
    // First query → event exists
    mockQuery
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ rsvp_count: 2, capacity: 5 }],
      })
      // Second → insert rsvp
      .mockResolvedValueOnce({})
      // Third → increment event count
      .mockResolvedValueOnce({});

    const res = await POST(mockReq({ userId: 99 }), mockContext({ id: 3 }));
    expect(res.body).toStrictEqual({ok: true, status: "RSVP"});
    expect(res.status).toBe(200);
  });

  test("INTERESTED when unlimited capacity", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ rsvp_count: 0, capacity: null }],
      })
      .mockResolvedValueOnce({});

    const res = await POST(mockReq({ userId: 9 }), mockContext({ id: 1 }));
    expect(res.body).toStrictEqual({ok: true, status: "INTERESTED"});
    expect(res.status).toBe(200);
  });

  test("WAITLISTED when event is full", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ rsvp_count: 10, capacity: 10 }],
      })
      .mockResolvedValueOnce({});

    const res = await POST(mockReq({ userId: 9 }), mockContext({ id: 1 }));
    expect(res.body).toStrictEqual({ok: true, status: "WAITLISTED"});
    expect(res.status).toBe(200);
  });

  test("duplicate RSVP returns 400", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ rsvp_count: 0, capacity: 5 }],
      })
      .mockRejectedValueOnce({ code: "23505" });

    const res = await POST(mockReq({ userId: 5 }), mockContext({ id: 7 }));
    expect(res.body).toStrictEqual({error: "User has already RSVP’d to this event"});
    expect(res.status).toBe(400);
  });

  test("db insert failure returns 500", async () => {
    mockQuery
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ rsvp_count: 0, capacity: 5 }],
      })
      .mockRejectedValueOnce({ code: "SOMETHING_ELSE" });

    const res = await POST(mockReq({ userId: 20 }), mockContext({ id: 22 }));

    expect(res.body).toStrictEqual({error: 'Database error'});
    expect(res.status).toBe(500);
  });
});

//
// ───────────────────────────────────────────────────────────────
//   GET TESTS
// ───────────────────────────────────────────────────────────────
//
describe("GET /api/rsvps/[id]", () => {
  test("returns event list", async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ id: 1, name: "Test Event" }],
    });

    const res = await GET({} as any, mockContext({ id: 123 }));
    expect(res.body).toStrictEqual({ events: [{ id: 1, name: "Test Event" }] });
    expect(res.status).toBe(200);

  });

  test("database error returns 500", async () => {
    mockQuery.mockRejectedValueOnce(new Error("db error"));

    const res = await GET({} as any, mockContext({ id: 123 }));
    expect(res.body).toStrictEqual({error: 'Something went wrong'});
    expect(res.status).toBe(500);  });
});

//
// ───────────────────────────────────────────────────────────────
//   DELETE TESTS
// ───────────────────────────────────────────────────────────────
//
describe("DELETE /api/rsvps/[id]", () => {

  const deleteReq = (body: any) =>
    new Request("http://localhost", {
      method: "DELETE",
      body: JSON.stringify(body),
    });

  test("returns 400 if user has not RSVP’d", async () => {
    mockQuery.mockResolvedValueOnce({ rowCount: 0 });

    const res = await DELETE(deleteReq({ userId: 1 }), mockContext({ id: 44 }));
    
    expect(res.body).toStrictEqual({error: "You have not RSVP’d for this event"});
    expect(res.status).toBe(400);
  });

  test("successful delete with RSVP decrement", async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ status: "RSVP" }] }) // existing check
      .mockResolvedValueOnce({}) // delete rsvp
      .mockResolvedValueOnce({}); // update rsvp_count

    const res = await DELETE(deleteReq({ userId: 9 }), mockContext({ id: 2 }));
    expect(res.body).toStrictEqual({ok: true, status: "CANCELLED"});
    expect(res.status).toBe(200);
  });

  test("successful delete without decrement (INTERESTED)", async () => {
    mockQuery
      .mockResolvedValueOnce({ rowCount: 1, rows: [{ status: "INTERESTED" }] }) 
      .mockResolvedValueOnce({});

    const res = await DELETE(deleteReq({ userId: 9 }), mockContext({ id: 2 }));
    expect(mockQuery).toHaveBeenCalledTimes(2); // no 3rd update query
  });

  test("db error returns 500", async () => {
    mockQuery.mockRejectedValueOnce(new Error("boom"));

    const res = await DELETE(deleteReq({ userId: 9 }), mockContext({ id: 2 }));
    expect(res.body).toStrictEqual({error: 'Something went wrong'});
    expect(res.status).toBe(500);
  });
});
