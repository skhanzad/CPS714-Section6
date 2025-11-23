import { NextResponse } from "next/server";
import getDb from "@/auth/db";


export async function POST(req: Request, context: any) {

    try
    {
        //get all the required parameters for the request
        const params = await context.params;
        const eventId = params.id;

        const body = await req.json();

        const userId = body.userId; // the user who is making the request

        const db = await getDb(); // we are going to connect to the data base, first thing i need to check is if its limited or unlimited capacity
        
        const currentEvent = await db.query(
                        `SELECT capacity, rsvp_count FROM events WHERE id = $1`,
                    [eventId]
        );
        console.log(currentEvent);
        if (currentEvent.rowCount === 0){ // so first chekc if the event was found, if not throw an error
            return NextResponse.json({error: "Event does not exist"},  {status: 404});
        }

        //next if the error wasnt thrown that means the event exists, so we will now try and RSVP to the event
        const { rsvp_count, capacity } = currentEvent.rows[0];
        let status = "RSVP";
        if (capacity === null) // the assignemnt said the event could have capacity or not, if it doesnt, mark it as interested
        {
            status = "INTERESTED" // going to try and keep this constant string as capital
        }

        else if (rsvp_count >= capacity){ // here we know that its a limited event and if the rsvp_count is greater than or equal to capacity, we cannot add another, so throw an error saying its full
            status = "WAITLIST";
        }


        // basically, this is to now update the rsvp table, so that we have an entry of the user wanting to go the the event
        try {
            await db.query(
                `INSERT INTO rsvps (user_id, event_id, status)
                VALUES ($1, $2, $3)`,
                [userId, eventId, status]
            );
        } catch (e: any) {
            if (e.code === "23505") { // unique constraint violation code
                return NextResponse.json(
                    { error: "User has already RSVP’d to this event" },
                    { status: 400 }
                );
            }
            console.error(e);
            return NextResponse.json(
                { error: "Database error" },
                { status: 500 }
            );
        }

        if (status == "RSVP"){ // ONCE AGAIN, if its a limited capacity event, we also need to update the events table, to update the rsvp_count because someone has just rsvpd
            await db.query(
                `UPDATE events SET rsvp_count = rsvp_count + 1 WHERE id = $1`,
                [eventId]
            );
        }
                    return NextResponse.json({ ok: true, status });


    }

    catch (err){
        return  NextResponse.json({error: "Something went wrong"},  {status: 500});

    }
}

export async function GET(req: Request, context: any) {
    try {

        const params = await context.params;
        const userId = params.id; // get the user id

        const db = await getDb();  // we are going to connect with db
        const result = await db.query(  // make the query to get interested
            `
            SELECT e.*, r.status
            FROM rsvps r
            JOIN events e ON e.id = r.event_id
            WHERE r.user_id = $1 AND  (r.status = 'RSVP' OR r.status = 'INTERESTED' OR r.status = 'WAITLIST')
            `,
            [userId]
        );

        return NextResponse.json({ events: result.rows });
    } catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, context: any) {

    try {

        const params = await context.params;
        const eventId = params.id;

        const body = await req.json();
        const userId = body.userId; // the user who is making the request

        const db = await getDb(); // connect to db

        // check if the user has RSVP'd for this event
        const existing = await db.query(
            `SELECT status 
             FROM rsvps 
             WHERE user_id = $1 AND event_id = $2`,
            [userId, eventId]
        );

        if (existing.rowCount === 0) { 
            return NextResponse.json(
                { error: "You have not RSVP’d for this event" },
                { status: 400 }
            );
        }

        const currentStatus = existing.rows[0].status;

        // delete the rsvp entry
        await db.query(
            `DELETE FROM rsvps 
             WHERE user_id = $1 AND event_id = $2`,
            [userId, eventId]
        );

        // if the user had RSVP'd, decrement rsvp_count (only for events with limited capacity)
        if (currentStatus === "RSVP") {
            await db.query(
                `UPDATE events 
                 SET rsvp_count = rsvp_count - 1 
                 WHERE id = $1 AND rsvp_count > 0`,
                [eventId]
            );

        const waitlist = await db.query(
        `
        SELECT user_id 
        FROM rsvps
        WHERE event_id = $1 AND status = 'WAITLIST'
        ORDER BY created_at ASC
        LIMIT 1
        `,
        [eventId]
    );
      if ((waitlist.rowCount ?? 0) > 0) { // if its a imited capacity event, and someone is waitlisted, add, the first person in the waitlist
                
        const nextUser = waitlist.rows[0].user_id;
        await db.query(
            `
            UPDATE rsvps
            SET status = 'RSVP'
            WHERE user_id = $1 AND event_id = $2
            `,
            [nextUser, eventId]
        );
        await db.query(
            `
            UPDATE events
            SET rsvp_count = rsvp_count + 1
            WHERE id = $1
            `,
            [eventId]
        );
        }
    } 
            return NextResponse.json({ ok: true, status: "CANCELLED" });

}
    
    catch (err) {
        console.error(err);
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 }
        );
    }
}