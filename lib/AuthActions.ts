'use server'

import clientPromise from "@/lib/mongodb";
import { cookies } from "next/headers";
import {redirect} from "next/dist/client/components/redirect";

export async function loginCLient(identifier: string) {
    const client = await clientPromise;
    const db = client.db('scheduling_App');
    const lowerIdentifier = identifier.toLowerCase();

    let user = await db.collection('clients').findOne({
        $or: [
            { email: lowerIdentifier },
            { phone: identifier }
        ]
    });

    let isNew = false;

    if (!user) {
        const newUser = {
            email: identifier.includes('@') ? lowerIdentifier : null,
            phone: !identifier.includes('@') ? identifier : null,
            createdAt: new Date(),
            role: 'client'
        };
        const result = await db.collection('clients').insertOne(newUser);
        user = { ...newUser, _id: result.insertedId };
        isNew = true;
    }

    const cookieStore = await cookies();
    cookieStore.set('client_session', identifier, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7,
        path: '/'
    });

    return {
        success: true,
        isNew: isNew,
        error: undefined
    };
}

export async function logoutClient() {
    (await cookies()).delete('client_session')
    redirect('/')

}