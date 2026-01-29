'use server'
import clientPromise from '@/lib/mongodb'
import {SERVICE_COLORS} from "@/lib/constants";
import {ObjectId} from "bson";
import {revalidatePath} from "next/dist/server/web/spec-extension/revalidate";
import {any} from "prop-types";
import {start} from "node:repl";
export async function getAppointments() {
    try {
        const client = await clientPromise;
        const db = client.db('scheduling_App');

        // Traemos todos, pero filtramos los que tengan el formato nuevo
        const appointments = await db.collection('appointments').find({}).toArray();

        return appointments.map(app => {

            const startISO = `${app.date}T${app.start}:00`;
            const endISO = `${app.date}T${app.finish}:00`;

            return {
                id: app._id.toString(),
                title: app.title,
                start: new Date(startISO),
                end: new Date(endISO),
                clientName: app.clientName,
                direction: app.direction,
                phone_number: app.phone_number,
                color_hex: app.color_hex,
                rawDate: app.date,
                rawStart: app.start,
                rawFinish: app.finish
            };
        });
    } catch (error) {
        console.error("Error fetching:", error);
        return [];
    }
}

export async function createAppointment(formData: FormData) {
    const client = await clientPromise;
    const db = client.db('scheduling_App');

    // Limpiamos la fecha para que sea solo "YYYY-MM-DD" como el dummy
    const rawDate = formData.get('selectedDate') as string;
    const cleanDate = rawDate.split('T')[0];

    const startTimeStr = formData.get('startTime') as string;
    const finishTimeStr = formData.get('endTime') as string;

    const startFormatted = `${startTimeStr.padStart(2, '0')}:00`;
    const finishFormatted = `${finishTimeStr.padStart(2, '0')}:00`;

    try {
        const sH = parseInt(startTimeStr);
        const eH = parseInt(finishTimeStr);

        // El Shield ahora usa el campo 'date' limpio
        const overlapping = await db.collection('appointments').findOne({
            date: cleanDate,
            $and: [
                { start_num: { $lt: eH } },
                { finish_num: { $gt: sH } }
            ]
        });

        if (overlapping) return { error: "Horario ocupado" };

        await db.collection('appointments').insertOne({
            date: cleanDate,           // RESULTADO: "2026-01-31" (Igual al dummy)
            start: startFormatted,    // RESULTADO: "12:00"
            finish: finishFormatted,  // RESULTADO: "15:00"
            // El timestamp debe llevar la fecha completa para que sea útil
            timestamp_start: `${cleanDate}T${startFormatted}:00Z`,
            clientName: formData.get('name'),
            direction: formData.get('address'),
            title: formData.get('service'),
            phone_number: formData.get('phone'),
            color_hex: SERVICE_COLORS[formData.get('service') as string] || "#001a57",
            start_num: sH,
            finish_num: eH
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (e) { return { error: "Error" }; }
}

export async function deleteAppointment(id: string){
try{
    const client = await clientPromise;
    const db = client.db('scheduling_App');

    const eventToDelete = await db.collection('appointments').deleteOne({
        _id: new ObjectId(id)
    });

    if (eventToDelete.deletedCount === 1){
        revalidatePath('/admin')
        return {
            success: true, message: "Event deleted correctly"
        }
    } else {
        return {
            error: true, message: "Event not Found"
        }
    }

}catch (error){
    console.error('Error Deleting this Appointment', error);
    }
}

export async function updateAppointment(id: string, formData: FormData){
    const client = await clientPromise;
    const db = client.db('scheduling_App');
    const service = formData.get('service');
    const name = formData.get('name');
    const address = formData.get('address');
    const phone = formData.get('phone');

    const rawSelectedDate = formData.get('selectedDate') as string;
    const startTimeStr = formData.get('startTime') as string;
    const finishTimeStr = formData.get('endTime') as string;

    try {
        const existingOverlap = await db.collection('appointments').findOne({
            date: rawSelectedDate,
            start: startTimeStr,
            finish: finishTimeStr,
            _id: { $ne: new ObjectId(id)}
        });

        if (existingOverlap){
            return { error: "This hour is reserved by another client" }
        }
        const startDate = new Date(rawSelectedDate);
        const startH = parseInt(startTimeStr);
        startDate.setHours(startH, 0, 0, 0);

        const finishDate = new Date(rawSelectedDate);
        let endH = parseInt(finishTimeStr);

        if (endH <= startH){
            endH = startH + 1;
        }
        finishDate.setHours(endH, 0, 0, 0)

        await db.collection('appointment').updateOne(
            {
                _id: new ObjectId(id)
            },
            {
                $set: {
                    title: service,
                    start: startDate,
                    finish: finishDate,
                    clientName: name,
                    direction: address,
                    phone_number: phone,
                    date: rawSelectedDate
                }
            }
        );
        revalidatePath('/admin')



    }catch(error){
        console.error('Error Updating the booking', error);
        return { error: "Booking not updated"}
    }
}