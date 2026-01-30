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

export async function updateAppointment(id: string, formData: FormData) {
    const client = await clientPromise;
    const db = client.db('scheduling_App');

    const service = formData.get('service') as string;
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const rawSelectedDate = formData.get('selectedDate') as string;

    const sH = parseInt(formData.get('startTime') as string);
    const eH = parseInt(formData.get('endTime') as string);

    const startTimeStr = `${sH.toString().padStart(2, '0')}:00`;
    const finishTimeStr = `${eH.toString().padStart(2, '0')}:00`;

    try {
        const overlapping = await db.collection('appointments').findOne({
            date: rawSelectedDate,
            _id: { $ne: new ObjectId(id) },
            $and: [
                { start_num: { $lt: eH } },
                { finish_num: { $gt: sH } }
            ]
        });

        if (overlapping) {
            return { error: "This hour is reserved by another client" };
        }

        await db.collection('appointments').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    title: service,
                    clientName: name,
                    direction: address,
                    phone_number: phone,
                    date: rawSelectedDate,
                    start: startTimeStr,
                    finish: finishTimeStr,
                    start_num: sH,
                    finish_num: eH
                }
            }
        );

        revalidatePath('/admin');
        return { success: true };

    } catch (error: any) {
        console.error('Error al actualizar:', error);
        return { error: "No se pudo actualizar la cita" };
    }
}