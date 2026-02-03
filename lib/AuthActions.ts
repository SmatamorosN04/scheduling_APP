"use server"

import clientPromise, {connectToDatabase} from "@/lib/mongodb";
import { cookies } from "next/headers";
import { encrypt } from "@/lib/session";
import {redirect} from "next/dist/client/components/redirect";
import nodemailer from "nodemailer";

export async function loginClient(email: string) {
    try {
        const { db } = await connectToDatabase();
        const cleanEmail = email.trim().toLowerCase();

        await db.collection("clients").updateOne(
            { email: cleanEmail },
            {
                $setOnInsert: {
                    email: cleanEmail,
                    createdAt: new Date(),
                    role: 'client'
                }
            },
            { upsert: true }
        );

        const code = Math.floor(100000 + Math.random() * 900000).toString();

        await db.collection("verification_codes").updateOne(
            { identifier: cleanEmail },
            {
                $set: {
                    identifier: cleanEmail,
                    code: code,
                    expiresAt: new Date(Date.now() + 10 * 60 * 1000)
                }
            },
            { upsert: true }
        );

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS,
            },
        });
        await transporter.sendMail({
            from: `"Seguridad Portal" <${process.env.GMAIL_USER}>`,
            to: cleanEmail,
            subject: 'Your Access code for entry to your portal ',
            html: `
                <div style="font-family: sans-serif; text-align: center; border: 1px solid #eee; padding: 20px;">
                    <h2>Código de Verificación</h2>
                    <p>Use the next code to verification of your account</p>
                    <h1 style="background: #f4f4f4; padding: 10px; display: inline-block; letter-spacing: 5px;">${code}</h1>
                    <p style="font-size: 12px; color: #888;">Este código expira en 10 minutos.</p>
                </div>
            `,
        });

        return { success: true };
    } catch (error) {
        console.error("Error en loginClient:", error);
        return { success: false, error: "No se pudo enviar el correo" };
    }
}


export async function verifyCodeAction(identifier: string, code: string) {
    try {
        const client = await clientPromise;
        const db = client.db('scheduling_App');

        const record = await db.collection('verification_codes').findOne({
            identifier,
            code,
            expiresAt: { $gt: new Date() }
        });

        if (!record) {
            return { success: false, error: "Invalid or expired code" };
        }

        await db.collection('verifications').deleteOne({ _id: record._id });

        const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const session = await encrypt({ email: identifier, expires });

        (await cookies()).set('client_session', session, {
            expires,
            httpOnly: false,
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
    try {
        const cookieStore = await cookies();

        cookieStore.delete('client_session');

        redirect('/');

        return { success: true };
    } catch (error) {
        console.error("Logout Error:", error);
        return { success: false, error: "Failed to log out" };
    }
}