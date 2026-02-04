
import nodemailer from "nodemailer";
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendReminderEmail(app: any, timeText: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    const is1h = timeText === "1 hora";

    return transporter.sendMail({
        from: `"Ariel's Scheduling App" <${process.env.GMAIL_USER}>`,
        to: app.clientEmail,
        subject: `Recordatorio: Tu cita es en ${timeText}`,
        html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
            <div style="background-color: ${is1h ? '#e67e22' : '#3498db'}; padding: 20px; text-align: center; color: white;">
                <h2 style="margin: 0;">⏰ Recordatorio de Cita</h2>
                <p style="margin: 5px 0 0 0;">Faltan aproximadamente ${timeText}</p>
            </div>
            <div style="padding: 30px; background-color: #fff;">
                <p>Hola <strong>${app.clientName}</strong>,</p>
                <p>Este es un recordatorio amistoso de tu próxima cita para el servicio de <strong>${app.title}</strong>.</p>
                
                <div style="margin: 20px 0; padding: 15px; border-left: 4px solid ${is1h ? '#e67e22' : '#3498db'}; background-color: #f9f9f9;">
                    <strong>Detalles:</strong><br>
                    📅 Fecha: ${app.date}<br>
                    ⏰ Hora: ${app.start}
                </div>

                <p style="font-size: 14px; color: #666;">Dirección registrada: ${app.direction}</p>
                <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                <p style="text-align: center; font-style: italic; color: #888;">¡Te esperamos!</p>
            </div>
        </div>`
    });
}