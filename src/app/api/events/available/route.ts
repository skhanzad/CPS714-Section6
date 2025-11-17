import { NextResponse } from "next/server";
import getDb from "@/auth/db";

export async function GET() {
    try {

        const db = await getDb(); // connect to database

        // Retrieve all events that have unlimited capacity OR still have remaining capacity
        const events = await db.query(
            `SELECT id, event_name, event_date, location, capacity, rsvp_count
             FROM events
             WHERE capacity IS NULL
                OR rsvp_count < capacity`
        );

        // If no events match the condition, return empty list
        return NextResponse.json(
            { events: events.rows },
            { status: 200 }
        );

    } catch (err) {
        console.error("Error retrieving available events:", err);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}