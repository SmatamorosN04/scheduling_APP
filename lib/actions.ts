'use server'
import clientPromise from '@/lib/mongodb'
import { SERVICE_COLORS } from "@/lib/constants";
import { ObjectId } from "mongodb";
import { revalidatePath } from "next/cache";

// Helper para limpiar la fecha y evitar que JS le aplique desfases UTC
// Convierte "2026-01-31" y "09" en un objeto Date local real
const createLocalInterval = (dateStr: string, startH: string, endH: string) => {
    const sH = parseInt(startH);
    let eH = parseInt(endH);
    if (eH <= sH) eH = sH + 1;

    // Al usar el formato T00:00:00 sin la 'Z', JS lo interpreta como hora local del sistema
    const start = new Date(`${dateStr}T${sH.toString().padStart(2, '0')}:00:00`);
    const end = new Date(`${dateStr}T${eH.toString().padStart(2, '0')}:00:00`);

    return { start, end, sH, eH };
};

export async function getAppointments() {
    try {
        const client = await clientPromise;
        const db = client.db('scheduling_App');
        const appointments = await db.collection('appointments').find({}).toArray();

        return appointments.map(app => ({
            id: app._id.toString(),
            title: app.title,
            start: new Date(app.start), // MongoDB guardará el Date, pero al traerlo será consistente
            end: new Date(app.finish),
            clientName: app.clientName,
            direction: app.direction,
            phone_number: app.phone_number,
            color_hex: app.color_hex
        }));
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return [];
    }
}

export async function createAppointment(formData: FormData) {
    try {
        const client = await clientPromise;
        const db = client.db('scheduling_App');

        const rawSelectedDate = formData.get('selectedDate') as string;
        const startTimeStr = formData.get('startTime') as string;
        const finishTimeStr = formData.get('endTime') as string;

        const { start, end, sH, eH } = createLocalInterval(rawSelectedDate, startTimeStr, finishTimeStr);

        /**
         * 🛡️ OVERLAP SHIELD PRO:
         * Una cita choca si: (Nueva_Inicio < Existente_Fin) Y (Nueva_Fin > Existente_Inicio)
         */
        const existingOverlap = await db.collection('appointments').findOne({
            date: rawSelectedDate,
            $and: [
                { start_num: { $lt: eH } },
                { finish_num: { $gt: sH } }
            ]
        });

        if (existingOverlap) {
            return { error: "This time slot overlaps with an existing appointment" };
        }

        const service = formData.get('service') as string;
        const color = SERVICE_COLORS[service] || SERVICE_COLORS['Instalation'];

        await db.collection('appointments').insertOne({
            title: service,
            start: start,          // Date Object (Local ISO)
            finish: end,           // Date Object (Local ISO)
            start_num: sH,         // Guardamos números para validación rápida
            finish_num: eH,
            date: rawSelectedDate, // String puro "YYYY-MM-DD"
            clientName: formData.get('name'),
            direction: formData.get('address'),
            phone_number: formData.get('phone'),
            color_hex: color
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error("error saving", error);
        return { error: "Error saving appointment" };
    }
}

export async function deleteAppointment(id: string) {
    try {
        const client = await clientPromise;
        const db = client.db('scheduling_App');

        const result = await db.collection('appointments').deleteOne({
            _id: new ObjectId(id)
        });

        if (result.deletedCount === 1) {
            revalidatePath('/dashboard');
            return { success: true, message: "Event deleted correctly" };
        }
        return { error: true, message: "Event not found" };
    } catch (error) {
        console.error('Error Deleting this Appointment', error);
        return { error: "Server error" };
    }
}

export async function updateAppointment(id: string, formData: FormData) {
    try {
        const client = await clientPromise;
        const db = client.db('scheduling_App');

        const rawSelectedDate = formData.get('selectedDate') as string;
        const startTimeStr = formData.get('startTime') as string;
        const finishTimeStr = formData.get('endTime') as string;

        const { start, end, sH, eH } = createLocalInterval(rawSelectedDate, startTimeStr, finishTimeStr);

        // Shield en Update ignorando el ID actual
        const existingOverlap = await db.collection('appointments').findOne({
            date: rawSelectedDate,
            _id: { $ne: new ObjectId(id) },
            $and: [
                { start_num: { $lt: eH } },
                { finish_num: { $gt: sH } }
            ]
        });

        if (existingOverlap) {
            return { error: "This hour is reserved by another client" };
        }

        const service = formData.get('service') as string;

        await db.collection('appointments').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: {
                    title: service,
                    start: start,
                    finish: end,
                    start_num: sH,
                    finish_num: eH,
                    clientName: formData.get('name'),
                    direction: formData.get('address'),
                    phone_number: formData.get('phone'),
                    date: rawSelectedDate,
                    color_hex: SERVICE_COLORS[service] || SERVICE_COLORS['Instalation']
                }
            }
        );

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Error Updating the booking', error);
        return { error: "Booking not updated" };
    }
}