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
            status = "INTERESTED" // going to try and keep this constant sstring as capital
        }

        else if (rsvp_count >= capacity){ // here we know that its a limited event and if the rsvp_count is greater than or equal to capacity, we cannot add another, so throw an error saying its full
            return  NextResponse.json({error: "The Event is Full"},  {status: 400});

        }


        // basically, this is to now update the rsvp table, so that we have an entry of the user wanting to go the the event
        await db.query(
            `INSERT INTO rsvps (user_id, event_id, status)
             VALUES ($1, $2, $3)`,
            [userId, eventId, status]
        );

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