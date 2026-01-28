import {NextResponse} from "next/server";
import clientPromise from "@/lib/mongodb";

export async function POST(request: Request){
    try{
        const body = await request.json();
        const {name, phone_number, direction, service, date, start } = body;

        const duration = service === "instalacion" ? 2 : 1

        const startHour = parseInt(start.split(":")[0]);
        const endHour = startHour + duration;
        const endTime = `${endHour.toString().padStart(2, '0')}:00`

        const client = await clientPromise;
        const db = client.db(process.env.DB_NAME);

        const newAppointment = await db.collection("appointments").insertOne({
            name, phone_number, direction,
            service, date, start, endTime, createdAt: new Date()
        });
        return NextResponse.json({ success: true, id: newAppointment.insertedId});
    } catch (e){
        return NextResponse.json({ error: "error saving the next appointments"}, {status: 500})
    }
}
export async function GET() {
    try {
        const client = await clientPromise;
        const db = client.db("scheduling_App");
        const rawEvents = await db.collection('appointments').find({}).toArray();

        const events = rawEvents.map((ev: any) => ({
            id: ev._id.toString(),
            title: ev.title || "Service without name",
            start: ev.start,
            end: ev.finish,

        }));

        return NextResponse.json(events);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch" }, { status: 500 });
    }
}