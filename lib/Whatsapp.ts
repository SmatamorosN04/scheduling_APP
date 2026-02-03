import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

export async function sendWhatsAppVerification(to: string, code: string) {
    try {
        const message = await client.messages.create({
            from: 'whatsapp:+14155238886',
            to: `whatsapp:${to}`,
            contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e',
            contentVariables: JSON.stringify({ "1": code })
        });

        console.log("WhatsApp sent! SID:", message.sid);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error("Error sending WhatsApp:", error);
        return { success: false, error };
    }
}