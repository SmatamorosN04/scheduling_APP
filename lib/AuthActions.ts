"use server"

import clientPromise, {connectToDatabase} from "@/lib/mongodb";
import { cookies } from "next/headers";
import { encrypt } from "@/lib/session";
import {redirect} from "next/dist/client/components/redirect";
import nodemailer from "nodemailer";
import twilio from "twilio";


export async function loginClient(input: string) {
    try {
        const { db } = await connectToDatabase();
        const identifier = input.trim().toLowerCase();

        const isEmail = identifier.includes('@');
        const isPhone = /^\d{8}$/.test(identifier);

        await db.collection("clients").updateOne(
            { [isEmail ? 'email' : 'phone']: identifier },
            {
                $setOnInsert: {
                    [isEmail ? 'email' : 'phone']: identifier,
                    createdAt: new Date(),
                    role: 'client'
                }
            },
            { upsert: true }
        );

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await db.collection("verification_codes").updateOne(
            { identifier: identifier },
            {
                $set: {
                    identifier: identifier,
                    code: code,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
                }
            },
            { upsert: true }
        );

        if (isEmail) {
            const transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS },
            });
            await transporter.sendMail({
                from: `"Seguridad Portal" <${process.env.GMAIL_USER}>`,
                to: identifier,
                subject: 'Your Access code',
                html: `<div style="text-align:center;"><h2>Código: ${code}</h2></div>`,
            });
        }

        if (isPhone) {
            const accountSid = process.env.TWILIO_ACCOUNT_SID;
            const authToken = process.env.TWILIO_AUTH_TOKEN;
            const client = twilio(accountSid, authToken);

            await client.messages.create({
                from: 'whatsapp:+14155238886',
                contentSid: 'HX229f5a04fd0510ce1b071852155d3e75',
                contentVariables: JSON.stringify({ "1": code }),
                to: 'whatsapp:+50587731532'
            });

            return { success: true };
        }

        return { success: true };
    } catch (error) {
        console.error("Error en loginClient:", error);
        return { success: false, error: "No se pudo enviar el código" };
    }
}

export async function verifyCodeAction(identifier: string, code: string) {
    try {
        const client = await clientPromise;
        const db = client.db('scheduling_App');

        const record = await db.collection('verification_codes').findOne({
            identifier: identifier,
            code: code,
            expiresAt: { $gt: new Date() }
        });

        if (!record) {
            return { success: false, error: "Invalid or expired code" };
        }

        await db.collection('verification_codes').deleteOne({ _id: record._id });

        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

        const session = await encrypt({ user: identifier, expires });

        (await cookies()).set('client_session', session, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return { success: true };
    } catch (error) {
        console.error("Verification Error:", error);
        return { success: false, error: "Internal server error" };
    }
}
export async function logoutClient() {
     let isSucessFul = false

    try {
        const cookieStore = await cookies();
        cookieStore.delete('client_session');
        isSucessFul = true


    } catch (error) {
        console.error("Logout Error:", error);
        return { success: false, error: "Failed to log out" };
    }
    if(isSucessFul){
        redirect('/clientLogin');
    }


}