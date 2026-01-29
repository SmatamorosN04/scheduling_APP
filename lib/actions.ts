'use server'
import clientPromise from '@/lib/mongodb'
import {SERVICE_COLORS} from "@/lib/constants";

export async function getAppointments() {
    try {
        const client = await clientPromise;
        const db = client.db('scheduling_App');

        const appointments = await db.collection('appointments').find({}).toArray();

        return appointments.map(app => ({
            id: app._id.toString(),
            title: app.title,
            start: new Date(app.start),
            end: new Date(app.finish),
        }));
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return [];
    }
}

export async function  createAppointment(formData: FormData){
    const client = await clientPromise;

    const db = client.db('scheduling_App')
    const service = formData.get('service');
    const name = formData.get('name');
    const address = formData.get('address');
    const phone = formData.get('phone');
    // @ts-ignore
    const color = SERVICE_COLORS[service] || SERVICE_COLORS['Instalation'];

    const rawSelectedDate = formData.get('selectedDate') as string;
    const startTimeStr = formData.get('startTime') as string;
    const finishTimeStr = formData.get('endTime') as string;


    try{
        const [year, month, day] = rawSelectedDate.split('-').map(Number);

        const startDate = new Date(year, month - 1, day, parseInt(startTimeStr), 0, 0);

        let endH = parseInt(finishTimeStr);
        if (endH <= parseInt(startTimeStr)) endH = parseInt(startTimeStr) + 1;

        const finishDate = new Date(year, month - 1, day, endH, 0, 0);

        await db.collection('appointments').insertOne({
            title: service,
            start: startDate,
            finish: finishDate,
                clientName: name,
                direction: address,
                phone_number: phone,
                color_hex: color
        });
    } catch (error){
        console.error("error saving", error);
        return{ message: "error saving"}
    }
}