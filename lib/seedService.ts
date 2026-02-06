'use server'
import clientPromise from "@/lib/mongodb";

export async function seedServices() {
    const client = await clientPromise;
    const db = client.db('scheduling_App');

    const initialServices = [
        {
            title: 'Field analysis',
            description: 'Evaluation of physical and technical conditions, electrical infrastructure, and space.',
            image: '/campo.png',
            color_hex: '#3498db',
            active: true,
            createdAt: new Date()
        },
        {
            title: 'Installation',
            description: 'Professional mounting, refrigerant line connection, and safety testing.',
            image: '/instalation.png',
            color_hex: '#39b82a',
            active: true,
            createdAt: new Date()
        },
        {
            title: 'Maintenance',
            description: 'Cleaning, refrigerant checking, and electrical inspection to extend equipment lifespan.',
            image: '/maintenance.png',
            color_hex: '#f1c40f',
            active: true,
            createdAt: new Date()
        }
    ];

    try {
        const result = await db.collection('services').insertMany(initialServices);
        return { success: true, inserted: result.insertedCount };
    } catch (e) {
        return { error: "La colección ya existe o hubo un error." };
    }
}