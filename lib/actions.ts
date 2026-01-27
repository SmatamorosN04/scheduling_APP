'use server'
import clientPromise from '@/lib/mongodb'

export async function  createAppointment(formData: FormData){
    const client = await clientPromise;

    const db = client.db('scheduling_App')
    const service = formData.get('service');
    const name = formData.get('name');
    const address = formData.get('address');
    const phone = formData.get('phone');

    try{
        await db.collection('appointments').insertOne({
            title: service,
            start: new Date(),
            finish: new Date(),
            resource: {
                clientName: name,
                direction: address,
                phone_number: phone,
            },
            status: 'pending'
        });
    } catch (error){
        console.error("error saving", error);
        return{ message: "error saving"}
    }


}