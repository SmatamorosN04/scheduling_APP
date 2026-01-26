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

        const newAppointment = await db.collection("apointments").insertOne({
            name, phone_number, direction,
            service, date, start, endTime, createdAt: new Date()
        });
        return NextResponse.json({ success: true, id: newAppointment.insertedId});
    } catch (e){
        return NextResponse.json({ error: "error saving the next appontment"}, {status: 500})
    }
}