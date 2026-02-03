'use server'
import clientPromise from '@/lib/mongodb'
import {SERVICE_COLORS} from "@/lib/constants";
import {ObjectId} from "bson";
import {revalidatePath} from "next/dist/server/web/spec-extension/revalidate";
import {cookies} from "next/dist/server/request/cookies";
import ALLOWED_TRANSITION, {AppointmentStatus} from "@/lib/appointment-logic";
import {sendEmail} from "@/lib/mail";
import {decrypt} from "@/lib/session";



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
                status: app.status,
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

    const session = (await cookies()).get('client_session');

    if (!session){
        return {error: "Not Exist active Session"}
    }

    const sessionData = await decrypt(session.value);

    const clientIdentifier = session.value;
    const userName = formData.get('name') as string;
    const service = formData.get('service') as string;
    // @ts-ignore
    const userEmail = sessionData.email as string;

    const mediaRaw = formData.get('media') as string;
    const mediaFiles = mediaRaw ? JSON.parse(mediaRaw) : [];

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

        const result = await db.collection('appointments').insertOne({

            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            date: cleanDate,
            start: startFormatted,
            finish: finishFormatted,

            timestamp_start: `${cleanDate}T${startFormatted}:00`,
            clientName: formData.get('name'),
            direction: formData.get('address'),
            title: formData.get('service'),
            clientEmail: userEmail,
            phone_number: formData.get('phone'),
            evidence: mediaFiles,

            color_hex: SERVICE_COLORS[formData.get('service') as string] || "#39b82a",
            start_num: sH,
            finish_num: eH
        });
        if (result.insertedId && userEmail) {

            await sendEmail({
                to: userEmail,
                subject: "- Ariel's Scheduling App",
                html: `
                    <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
                        <h2 style="color: #39b82a;">¡Hello ${name}!</h2>
                        <p>Your Request was received <strong>${service}</strong>.</p>
                        <hr style="border: none; border-top: 1px solid #eee;" />
                        <p><strong>Request detail</strong></p>
                        <ul>
                            <li><strong>Fecha:</strong> ${cleanDate}</li>
                            <li><strong>Horario:</strong> ${startFormatted} - ${finishFormatted}</li>
                        </ul>
                        <p style="background: #fdf6b2; padding: 10px; border-radius: 5px;">
                            📍 <strong>Estado:</strong> Pending ariel confirmation
                        </p>
                        <p style="font-size: 0.8em; color: #777;">You will receive another email as soon as your appointment is confirmed.</p>
                    </div>
                `
            });
        }

        revalidatePath('/dashboard');
        revalidatePath('/portal')
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

    const status = formData.get('status') as string

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
        const fieldsToUpdate: any = {
            title: service,
            clientName: name,
            direction: address,
            phone_number: phone,
            date: rawSelectedDate,
            start: startTimeStr,
            finish: finishTimeStr,
            start_num: sH,
            finish_num: eH,
            updatedAt: new Date()
        };

        const fieldsToUnset: any = {};

        if (status) {
            fieldsToUpdate.status = status;
            const now = new Date();

            fieldsToUnset.pendingAt = "";
            fieldsToUnset.startedAt = "";
            fieldsToUnset.completedAt = "";
            fieldsToUnset.cancelledAt = "";
            fieldsToUnset.noShowAt = "";

            switch (status) {
                case 'pending':
                    fieldsToUpdate.pendingAt = now;
                    delete fieldsToUnset.pendingAt;
                    break;
                case 'in-progress':
                    fieldsToUpdate.startedAt = now;
                    delete fieldsToUnset.startedAt;
                    break;
                case 'completed':
                    fieldsToUpdate.completedAt = now;
                    delete fieldsToUnset.completedAt;
                    break;
                case 'cancelled':
                    fieldsToUpdate.cancelledAt = now;
                    delete fieldsToUnset.cancelledAt;
                    break;
                case 'no-show':
                    fieldsToUpdate.noShowAt = now;
                    delete fieldsToUnset.noShowAt;
                    break;
            }
        }

        await db.collection('appointments').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: fieldsToUpdate,
                $unset: fieldsToUnset
            }
        );

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { error: "Error al actualizar" };
    }
}


export async function  updateAppointmentStatus(id: string, nextStatus: AppointmentStatus){

    const client = await clientPromise;
    const db = client.db('scheduling_App');

    try{
        const currentAppointment = await db.collection('appointments').findOne({
            _id: new ObjectId(id)
        });

        if (!currentAppointment) return {error: "Appointment not Found"};

        const currentStatus = (currentAppointment.status || 'pending') as AppointmentStatus;

        if (nextStatus !== currentStatus){
            if (!ALLOWED_TRANSITION[currentStatus].includes(nextStatus)) {
                return { error: `Forbidden move: ${currentStatus} -> ${nextStatus}`};
            }
        }

        const now = new Date();
        const fieldsToUpdate: any ={
            status: nextStatus,
            updateAt: now
        };

        const timestampMap: Record<string, string> = {
            'pending': 'pendiingAt',
            'Confirmed': 'confirmedAt',
            'On-Route': 'onRouteAt',
            'In-Progress': 'startedAt',
            'Finished': 'completedAt',
            'Cancelled' : 'cancelledAt'
        };

        const specificTimestampField = timestampMap[nextStatus];
        if (specificTimestampField) {
            fieldsToUpdate[specificTimestampField] = now;
        }

        await  db.collection('appointments').updateOne(
            {_id: new ObjectId(id)},
            { $set: fieldsToUpdate}
        );

        revalidatePath('/admin');
        return { success: true}
    } catch (error) {
        console.error("Update Error:", error);
        return { error: "Error updating status" };
    }
}

