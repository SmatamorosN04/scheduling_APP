
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

export async function sendEmail({to, subject,html}:EmailOptions){
    try{
        const info = await transporter.sendMail({
            from: `"Ariels Scheduling App " <${process.env.GMAIL_USER}>`,
            to,
            subject,
            html,
        });
        console.log("Message sent: %s", info.messageId);
        return { success: true};
    } catch (error){
        console.error('email error', error);
        return {success: false, error}
    }

}