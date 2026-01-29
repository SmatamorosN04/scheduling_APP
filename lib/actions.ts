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

        const appointments = await db.collection('appointments').find({}).toArray();

        return appointments.map(app => {

            const startDate = new Date(`${app.date.split('T')[0]}T${app.start}:00`);
            const endDate = new Date(`${app.date.split('T')[0]}T${app.finish}:00`);

            // 2. Si estamos en el despliegue (producción), sumamos las 6 horas
            // Comprobamos si el entorno es producción o si el offset es 0 (UTC)
            if (process.env.NODE_ENV === 'production' || startDate.getTimezoneOffset() === 0) {
                startDate.setHours(startDate.getHours() + 6);
                endDate.setHours(endDate.getHours() + 6);
            }
            return {
                id: app._id.toString(),
                title: app.title,
                start: startDate,
                end: endDate,
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

    const rawDate = formData.get('selectedDate') as string;
    const cleanDate = rawDate.split('T')[0];

    const startTimeStr = formData.get('startTime') as string;
    const finishTimeStr = formData.get('endTime') as string;

    const startFormatted = `${startTimeStr.padStart(2, '0')}:00`;
    const finishFormatted = `${finishTimeStr.padStart(2, '0')}:00`;

    try {
        const sH = parseInt(startTimeStr);
        const eH = parseInt(finishTimeStr);

        const overlapping = await db.collection('appointments').findOne({
            date: cleanDate,
            $and: [
                { start_num: { $lt: eH } },
                { finish_num: { $gt: sH } }
            ]
        });

        if (overlapping) return { error: "Horario ocupado" };

        await db.collection('appointments').insertOne({
            date: cleanDate,
            start: startFormatted,
            finish: finishFormatted,

            timestamp_start: `${cleanDate}T${startFormatted}:00`,
            clientName: formData.get('name'),
            direction: formData.get('address'),
            title: formData.get('service'),
            phone_number: formData.get('phone'),
            color_hex: SERVICE_COLORS[formData.get('service') as string] || "#39b82a",
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