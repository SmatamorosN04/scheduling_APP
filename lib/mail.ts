import nodemailer from 'nodemailer';

export async function sendEmailVerification(email: string, code: string) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS,
        },
    });

    try {
        await transporter.sendMail({
            from: `"Seguridad Portal" <${process.env.GMAIL_USER}>`,
            to: email,
            subject: 'Tu código de acceso',
            html: `
        <div style="font-family: sans-serif; text-align: center;">
          <h2>Código de Verificación</h2>
          <p>Tu código es:</p>
          <h1 style="color: #000; letter-spacing: 5px;">${code}</h1>
        </div>
      `,
        });
        return { success: true };
    } catch (error) {
        console.error("Error enviando email:", error);
        return { success: false };
    }
}