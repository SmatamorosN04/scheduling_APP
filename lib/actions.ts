'use server'
import clientPromise from '@/lib/mongodb'

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

    const rawSelectedDate = formData.get('selectedDate') as string;
    const startTimeStr = formData.get('startTime') as string;
    const endTimeStr = formData.get('endTime') as string;


    try{
        const startDate = new Date(rawSelectedDate);
        const [startHours] = startTimeStr.split(':');
        startDate.setHours(parseInt(startHours), 0, 0, 0);

        const finishDate = new Date(rawSelectedDate);
        const [finishHours] = endTimeStr.split(':');
        finishDate.setHours(parseInt(finishHours), 0, 0, 0);


        await db.collection('appointments').insertOne({
            title: service,
            start: startDate,
            finish: finishDate,
                clientName: name,
                direction: address,
                phone_number: phone,

        });
    } catch (error){
        console.error("error saving", error);
        return{ message: "error saving"}
    }
}