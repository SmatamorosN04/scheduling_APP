import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");

    if (!date) {
        return NextResponse.json({ error: "date is lefting" }, { status: 400 });
    }

    try {
        const client = await clientPromise;
        const db = client.db(process.env.DB_NAME);

        const appointments = await db
            .collection("Appointments")
            .find({ date: date })
            .toArray();

        const allSlots = [
            "08:00", "09:00", "10:00", "11:00", "12:00",
            "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
        ];

        const availableSlots = allSlots.filter((slot) => {
            const isOccupied = appointments.some((app) => {
                return slot >= app.startTime && slot < app.endTime;
            });
            return !isOccupied;
        });

        return NextResponse.json({ date, availableSlots });
    } catch (e) {
        return NextResponse.json({ error: "Error de conexión" }, { status: 500 });
    }
}