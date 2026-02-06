'use server'
import clientPromise from '@/lib/mongodb'
import {SERVICE_COLORS} from "@/lib/constants";
import {ObjectId} from "bson";
import {revalidatePath} from "next/dist/server/web/spec-extension/revalidate";
import {cookies} from "next/dist/server/request/cookies";
import ALLOWED_TRANSITION, {AppointmentStatus} from "@/lib/appointment-logic";
import {decrypt} from "@/lib/session";
import nodemailer from "nodemailer";
import {redirect} from "next/dist/client/components/redirect";



import twilio from "twilio";

export async function getAppointments() {
    try {
        const client = await clientPromise;
        const db = client.db('scheduling_App');

        const appointments = await db.collection('appointments').find({}).toArray();

        return appointments.map(app => {

            const startDate = new Date(`${app.date.split('T')[0]}T${app.start}:00`);
            const endDate = new Date(`${app.date.split('T')[0]}T${app.finish}:00`);


            if (process.env.NODE_ENV === 'production' || startDate.getTimezoneOffset() === 0) {
                startDate.setHours(startDate.getHours() + 6);
                endDate.setHours(endDate.getHours() + 6);
            }
            return {
                id: app._id.toString(),
                title: app.title,
                start: startDate,
                end: endDate,
                clientName: app.clientName,
                direction: app.direction,
                phone_number: app.phone_number,
                color_hex: app.color_hex,
                status: app.status,
                rawDate: app.date,
                rawStart: app.start,
                rawFinish: app.finish,
                evidence: app.evidence || []
            };
        });
    } catch (error) {
        console.error("Error fetching:", error);
        return [];
    }
}

export async function createAppointment(formData: FormData) {
    const client = await clientPromise;
    const db = client.db('scheduling_App');

    const session = (await cookies()).get('client_session');

    if (!session){
        return {error: "Not Exist active Session"}
    }

    const sessionData = await decrypt(session.value);

    if (!sessionData) {
        return { error: "Invalid or expired session" };
    }

    const userName = formData.get('name') as string;
    const service = formData.get('service') as string;
    const rawId = (sessionData.user as string || sessionData.email as string || sessionData.identifier as string || "").replace(/['"]+/g, '').trim();

    const isEmailLogin = rawId.includes('@');


    const finalEmail = isEmailLogin ? rawId : (formData.get('email') as string || "");
    const finalPhone = isEmailLogin ? (formData.get('phone') as string || "") : rawId;

    const mediaRaw = formData.get('media') as string;
    const mediaFiles = mediaRaw ? JSON.parse(mediaRaw) : [];

    const rawDate = formData.get('selectedDate') as string;
    const cleanDate = rawDate.split('T')[0];

    const startTimeStr = formData.get('startTime') as string;
    const finishTimeStr = formData.get('endTime') as string;

    const startFormatted = `${startTimeStr.padStart(2, '0')}:00`;
    const finishFormatted = `${finishTimeStr.padStart(2, '0')}:00`;



    try {
        const sH = parseInt(startTimeStr);
        const eH = parseInt(finishTimeStr);

        const creationDate = new Date();
        creationDate.setHours(creationDate.getHours() - 6 );


        const overlapping = await db.collection('appointments').findOne({

            date: cleanDate,
            status: { $ne: "Cancelled"},
            $and: [
                { start_num: { $lt: eH } },
                { finish_num: { $gt: sH } }
            ]
        });

        if (overlapping) return { error: "Tihs Hours are Occupied" };

        const existingProfile = await db.collection('appointments').findOne({
            clientEmail: finalEmail
        })
        if (existingProfile && existingProfile.phone_number.replace(/\D/g, '') !== finalPhone) {
            return { error: "This email is already linked to another phone number." };
        }



        const result =  await db.collection('appointments').insertOne({
            status: 'pending',
            createdAt: creationDate,
            date: cleanDate,
            start: startFormatted,
            finish: finishFormatted,
            timestamp_start: `${cleanDate}T${startFormatted}:00`,
            clientName: formData.get('name'),
            direction: formData.get('address'),
            title: service,
            clientEmail: finalEmail,
            phone_number: finalPhone,
            clientIdentifier: rawId,
            evidence: mediaFiles,
            color_hex: SERVICE_COLORS[formData.get('service') as string] || "#39b82a",
            start_num: sH,
            finish_num: eH,
            sent24h: false,
            sent1h: false
        });

          if (result.insertedId && finalEmail.includes('@')){
              try{
                  const transporter = nodemailer.createTransport({
                      service: 'gmail',
                      auth: {
                          user: process.env.GMAIL_USER,
                          pass: process.env.GMAIL_PASS
                      }
                  });
                  await transporter.sendMail({
                      from: `"Ariel's Scheduling App" <${process.env.GMAIL_USER}>`,
                      to: finalEmail,
                      subject: "Ariel's Scheduling App",
                      html: `
                      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #f8f9fa; padding: 25px; border-bottom: 4px solid #39b82a;">
        <h1 style="margin: 0; font-size: 20px; color: #1a1a1a; letter-spacing: 0.5px;">
            Service Request Confirmation
        </h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">ID: ${result.insertedId.toString().slice(-6).toUpperCase()}</p>
    </div>

    <div style="padding: 30px;">
        <p style="font-size: 16px; line-height: 1.5;">
            Dear <strong>${userName}</strong>,
        </p>
        <p style="font-size: 15px; color: #555; line-height: 1.5;">
            We have successfully received your service request for <strong>${service}</strong>. Our team is currently reviewing the details and will get back to you shortly.
        </p>
            <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #fff9db; color: #856404; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1px solid #ffeeba;">
                STATUS: PENDING
            </span>
        </div>
        <div style="margin: 25px 0; background-color: #ffffff; border: 1px solid #eee; border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #777; font-size: 13px; text-transform: uppercase;">Date</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: 600;">${cleanDate}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 15px; color: #777; font-size: 13px; text-transform: uppercase;">Time Slot</td>
                    <td style="padding: 12px 15px; font-weight: 600;">${startFormatted} — ${finishFormatted}</td>
                </tr>
            </table>
        </div>

        

        <p style="font-size: 14px; color: #777; text-align: center; font-style: italic;">
            No further action is required at this time. You will receive a notification once your appointment has been officially confirmed.
        </p>
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
        <p style="margin: 0; font-size: 12px; color: #999;">
            &copy; 2026 Ariel's Tech Service. All rights reserved.<br>
            This is an automated message, please do not reply directly to this email.
        </p>
    </div>
</div>`,
                  })

              } catch (error){
                    console.error('error sending create notification ')
              }
          }
        if (result.insertedId && finalPhone) {
            try {
                const accountSid = process.env.TWILIO_ACCOUNT_SID;
                const authToken = process.env.TWILIO_AUTH_TOKEN;
                const client = twilio(accountSid, authToken);

                const messageBody =
                    `Hello *${userName}*! 👋\n\n` +
                    `We have successfully received your service request for *${service}*.\n\n` +
                    `📅 *Date:* ${cleanDate}\n` +
                    `⏰ *Time Slot:* ${startFormatted}\n` +
                    `📍 *Status:* PENDING\n\n` +
                    `No further action is required at this time. Our team will contact you shortly 
                    to confirm your appointment. Thank you for choosing Ariel's Tech Service!`;

                client.messages
                    .create({
                        from: 'whatsapp:+14155238886',
                        body:  messageBody,
                        to: 'whatsapp:+50587731532'
                    })
                    .then((message: any) => console.log(message.sid))


            } catch (wsError) {
                console.error('Error en Twilio:', wsError);
            }
        }


        revalidatePath('/dashboard');
        revalidatePath('/portal')
        return { success: true };
    } catch (e) { return { error: "Error" };
    }
}

export async function deleteAppointment(id: string){
try{
    const client = await clientPromise;
    const db = client.db('scheduling_App');

    const eventToDelete = await db.collection('appointments').deleteOne({
        _id: new ObjectId(id)
    });

    if (eventToDelete.deletedCount === 1){
        revalidatePath('/admin')
        return {
            success: true, message: "Event deleted correctly"
        }
    } else {
        return {
            error: true, message: "Event not Found"
        }
    }

}catch (error){
    console.error('Error Deleting this Appointment', error);
    }
}

export async function updateAppointment(id: string, formData: FormData) {
    const client = await clientPromise;
    const db = client.db('scheduling_App');

    const currentAppt = await db.collection('appointments').findOne({ _id: new ObjectId(id)});
    if (!currentAppt) return {error: "Appointment not found"}

    const service = formData.get('service') as string;
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;
    const phone = formData.get('phone') as string;
    const rawSelectedDate = formData.get('selectedDate') as string;

    const status = formData.get('status') as string

    const sH = parseInt(formData.get('startTime') as string);
    const eH = parseInt(formData.get('endTime') as string);

    const startTimeStr = `${sH.toString().padStart(2, '0')}:00`;
    const finishTimeStr = `${eH.toString().padStart(2, '0')}:00`;

    try {
        const standarizedDate = new Date()
        standarizedDate.setHours(standarizedDate.getHours() - 6)


        if (status !== 'Cancelled'){ const overlapping = await db.collection('appointments').findOne({
            date: rawSelectedDate,
            status: {
                $in: ['Confirmed', 'In-Progress', 'pending']
            },
            _id: { $ne: new ObjectId(id) },
            $and: [
                { start_num: { $lt: eH } },
                { finish_num: { $gt: sH } }
            ]
        });

            if (overlapping) {
                return { error: `The slot ${startTimeStr} - ${finishTimeStr} is already taken by another appointment.` };
            }
        }

        const fieldsToUpdate: any = {
            title: service,
            clientName: name,
            direction: address,
            phone_number: phone,
            date: rawSelectedDate,
            start: startTimeStr,
            finish: finishTimeStr,
            start_num: sH,
            finish_num: eH,
            updatedAt: standarizedDate,
            sent24h: currentAppt.date !== rawSelectedDate || currentAppt.start_num !== sH ? false : currentAppt.sent24h,
            sent1h: currentAppt.date !== rawSelectedDate || currentAppt.start_num !== sH ? false : currentAppt.sent1h

        };

        const fieldsToUnset: any = {};

        if (status) {
            fieldsToUpdate.status = status;

            fieldsToUnset.pendingAt = "";
            fieldsToUnset.startedAt = "";
            fieldsToUnset.completedAt = "";
            fieldsToUnset.cancelledAt = "";
            fieldsToUnset.noShowAt = "";

            switch (status) {
                case 'pending':
                    fieldsToUpdate.pendingAt = standarizedDate;
                    delete fieldsToUnset.pendingAt;
                    break;
                case 'in-progress':
                    fieldsToUpdate.startedAt = standarizedDate;
                    delete fieldsToUnset.startedAt;
                    break;
                case 'completed':
                    fieldsToUpdate.completedAt = standarizedDate;
                    delete fieldsToUnset.completedAt;
                    break;
                case 'cancelled':
                    fieldsToUpdate.cancelledAt = standarizedDate;
                    delete fieldsToUnset.cancelledAt;
                    break;
                case 'no-show':
                    fieldsToUpdate.noShowAt = standarizedDate;
                    delete fieldsToUnset.noShowAt;
                    break;
            }
        }

        await db.collection('appointments').updateOne(
            { _id: new ObjectId(id) },
            {
                $set: fieldsToUpdate,
                $unset: fieldsToUnset
            }
        );

        const dateChanged = currentAppt.date !== rawSelectedDate;
        const timeChanged = currentAppt.start_num !== sH;


        const clientIdentifier = currentAppt.clientEmail;
        const isEmail = clientIdentifier?.includes('@');

        if ((dateChanged || timeChanged) && isEmail) {
            await notifyClientReschedule(
                clientIdentifier,
                service,
                currentAppt.date,
                rawSelectedDate,
                startTimeStr
            );
        }


        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { error: "Error al actualizar" };
    }
}

export async function getClientHistory(identifier: string){
    try{
        const client = await clientPromise;
        const db = client.db('scheduling_App');

        const normalizedIdentifier = identifier.toLowerCase().trim();

        const cleanPhone = normalizedIdentifier.replace(/\D/g, '');

        const history = await db.collection('appointments')
            .find({
                $or: [
                    {clientEmail: normalizedIdentifier},
                    {phone_number: cleanPhone}
                ]
            })
            .sort({ date: -1 })
            .toArray();

        return history.map(doc => ({
            _id: doc._id.toString(),
            title: doc.title,
            status: doc.status,
            date: doc.date,
            start: doc.start,
            finish: doc.finish,
            color_hex: doc.color_hex
        }));
    } catch (error){
        console.error("error getting the history", error)
        return [];
    }
}

export async function cancelAppointmentByClient(id: string){
    try {
        const client = await clientPromise;
        const db = client.db('scheduling_App');

        const appointment = await db.collection('appointments').findOne({
            _id: new ObjectId(id)
        });

        if(!appointment) throw new Error('event not found ');

        const validStates = ['pending', 'Confirmed'];
        if (!validStates.includes(appointment.status)){
            return{
                success: false,
                message: 'you dont have permission to delete the event, please contact Ariel'
            };
        }

        await db.collection('appointments').updateOne(
            {_id: new ObjectId(id)},
            { $set: {
                status: 'Cancelled',
                    cancelledAt: new Date(),
                    cancelledBy: 'client'
                }}
        );

        await notifyAdmin(
            `Cancelled: ${appointment.title}`,
            `The client <b>${appointment.clientName}</b>`
        );

        revalidatePath('/portal')

    }catch (error){
        console.error('error cancel', error );
        return {success: false, message: "Intern server Error"}
    }
}

export async function  updateAppointmentStatus(id: string, nextStatus: AppointmentStatus){

    const client = await clientPromise;
    const db = client.db('scheduling_App');

    try{
        const currentAppointment = await db.collection('appointments').findOne({
            _id: new ObjectId(id)
        });

        if (!currentAppointment) return {error: "Appointment not Found"};

        const currentStatus = (currentAppointment.status || 'pending') as AppointmentStatus;

        if (nextStatus !== currentStatus){
            if (!ALLOWED_TRANSITION[currentStatus].includes(nextStatus)) {
                return { error: `Forbidden move: ${currentStatus} -> ${nextStatus}`};
            }
        }

        const now = new Date();
        now.setHours(now.getHours() - 6)
        const fieldsToUpdate: any ={
            status: nextStatus,
            updateAt: now
        };

        if (nextStatus === 'Confirmed') {
            fieldsToUpdate.sent24h = false;
            fieldsToUpdate.sent1h = false;
        }

        const timestampMap: Record<string, string> = {
            'pending': 'pendiingAt',
            'Confirmed': 'confirmedAt',
            'On-Route': 'onRouteAt',
            'In-Progress': 'startedAt',
            'Finished': 'completedAt',
            'Cancelled' : 'cancelledAt'
        };

        const specificTimestampField = timestampMap[nextStatus];
        if (specificTimestampField) {
            fieldsToUpdate[specificTimestampField] = now;
        }

        await  db.collection('appointments').updateOne(
            {_id: new ObjectId(id)},
            { $set: fieldsToUpdate}
        );

        const statusWithNotifications = ['Confirmed', 'On-Route', 'Cancelled'];

        const targetEmail = currentAppointment.clientEmail;
        const targetName = currentAppointment.clientName ;

        if (statusWithNotifications.includes(nextStatus) && targetEmail) {
            try {
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.GMAIL_USER,
                        pass: process.env.GMAIL_PASS
                    }
                });

                const color = nextStatus === 'Confirmed' ? '#39b82a' : nextStatus === 'On-Route' ? '#007bff' : '#dc3545';

                await transporter.sendMail({
                    from: `"Ariel's Scheduling App" <${process.env.GMAIL_USER}>`,
                    to: targetEmail,
                    subject: `Update: Appointment ${nextStatus}`,
                    html: `
<div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #f8f9fa; padding: 25px; border-bottom: 4px solid ${color};">
        <h1 style="margin: 0; font-size: 20px; color: #1a1a1a; letter-spacing: 0.5px;">
            Service Status Update
        </h1>
        <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">ID: ${id.toString().slice(-6).toUpperCase()}</p>
    </div>

    <div style="padding: 30px;">
        <p style="font-size: 16px; line-height: 1.5;">
            Dear <strong>${targetName}</strong>,
        </p>
        <p style="font-size: 15px; color: #555; line-height: 1.5;">
            We are writing to inform you that your service request for <strong>${currentAppointment.title || 'Service'}</strong> has been updated to:
        </p>

        <div style="text-align: center; margin: 20px 0;">
            <span style="background-color: ${color}15; color: ${color}; padding: 10px 24px; border-radius: 20px; font-size: 14px; font-weight: 700; border: 1px solid ${color}30; text-transform: uppercase;">
                ${nextStatus}
            </span>
        </div>

        <div style="margin: 25px 0; background-color: #ffffff; border: 1px solid #eee; border-radius: 6px;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #777; font-size: 13px; text-transform: uppercase;">Service</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: 600;">${currentAppointment.title || 'N/A'}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee; color: #777; font-size: 13px; text-transform: uppercase;">Date</td>
                    <td style="padding: 12px 15px; border-bottom: 1px solid #eee; font-weight: 600;">${currentAppointment.date}</td>
                </tr>
                <tr>
                    <td style="padding: 12px 15px; color: #777; font-size: 13px; text-transform: uppercase;">Time</td>
                    <td style="padding: 12px 15px; font-weight: 600;">${currentAppointment.start} — ${currentAppointment.finish}</td>
                </tr>
            </table>
        </div>

        <p style="font-size: 14px; color: #777; text-align: center; font-style: italic;">
            ${nextStatus === 'Cancelled'
                        ? 'If you have questions about this cancellation, please contact us.'
                        : 'No further action is required. We will keep you updated on any further changes.'}
        </p>
    </div>

    <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
        <p style="margin: 0; font-size: 12px; color: #999;">
            &copy; 2026 Ariel's Tech Service. All rights reserved.<br>
            This is an automated message, please do not reply directly to this email.
        </p>
    </div>
</div>
`
                });
                console.log(" Email sent successfully to:", targetEmail);
            } catch (mailError) {
                console.error(" Nodemailer failed:", mailError);
            }
            try {
                //changed
                const accountSid = process.env.TWILIO_ACCOUNT_SID;
                const authToken = process.env.TWILIO_AUTH_TOKEN;
                const clientTwilio = twilio(accountSid, authToken);

                const messageBody =
                    `Update: *${nextStatus.toUpperCase()}* 📢\n\n` +
                    `Hello *${targetName}*,\n` +
                    `The status of your *${currentAppointment.title || 'service'}* request has been updated to: *${nextStatus}*.\n\n` +
                    `📅 *Date:* ${currentAppointment.date}\n` +
                    `⏰ *Time:* ${currentAppointment.start}\n\n` +
                    `Thank you for your patience!`;

                clientTwilio.messages
                    .create({
                        from: 'whatsapp:+14155238886',
                        body: messageBody,
                        to: `whatsapp:+50587731532`
                    })
                    .then((m: any) => console.log("📱 WhatsApp Update Sent:", m.sid))

            } catch (wsError) {
                console.error('Twilio Error:', wsError);
            }
        }
        revalidatePath('/admin');
        return { success: true}
    } catch (error) {
        console.error("Update Error:", error);
        return { error: "Error updating status" };
    }
}

export async function notifyAdmin(subject: string, details: string) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"SystemAlert" <${process.env.GMAIL_USER}>`,
            to: "sergio.matampros12@gmail.com",
            subject: subject,
            html: `
<div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; color: #333; border: 1px solid #efefef; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <div style="background-color: #ffffff; padding: 30px 25px; border-bottom: 4px solid #ef4444; text-align: center;">
        <h2 style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #888;">Admin Notification</h2>
        <h1 style="margin: 10px 0 0 0; font-size: 24px; color: #1a1a1a; font-weight: 700;">🚨 Cancellation of Event</h1>
    </div>

    <div style="padding: 40px 35px; background-color: #ffffff;">
        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
            Hello <strong>Ariel</strong>,
        </p>
        <p style="margin: 0 0 30px 0; font-size: 15px; color: #555; line-height: 1.6;">
            A client has just cancelled their service. Here are the updated details:
        </p>

        <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; border: 1px solid #f0f0f0;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #777; font-size: 13px; width: 100px;">Client</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #1a1a1a;">
                        ${details.split('</b>')[0].replace('<b>', '')}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #777; font-size: 13px;">Date</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #1a1a1a;">
                        ${new Date().toLocaleDateString()}
                    </td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #777; font-size: 13px;">Status</td>
                    <td style="padding: 8px 0;">
                        <span style="background-color: #ef444420; color: #ef4444; padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: 700; border: 1px solid #ef444440;">
                            CANCELLED
                        </span>
                    </td>
                </tr>
            </table>
        </div>

        <p style="margin: 30px 0 0 0; font-size: 14px; color: #888; text-align: center; font-style: italic;">
            Please see the dashboard for more information.
        </p>
    </div>

    <div style="background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
        <p style="margin: 0; font-size: 12px; color: #aaa; line-height: 1.4;">
            &copy; 2026 Ariel's Tech Service. All rights reserved.<br>
            This is an automated administrative alert.
        </p>
    </div>
</div>
`
        });
    }catch (error) {
        console.log('error notifying admin:', error)
    }
}

export async function saveService(formData: FormData) {
    const client = await clientPromise;
    const db = client.db('scheduling_App');

    const id = formData.get('id') as string;
    const serviceData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        image: formData.get('image') as string,
        duration_hours: parseInt(formData.get('duration') as string) || 1,
        color_hex: formData.get('color') as string || "#39b82a",
        active: true
    };

    if (id) {
        await db.collection('services').updateOne(
            { _id: new ObjectId(id) },
            { $set: serviceData }
        );
    } else {
        await db.collection('services').insertOne(serviceData);
    }

    revalidatePath('/admin/services');
    revalidatePath('/clients');
}

export async function deleteService(id: string) {
    const client = await clientPromise;
    const db = client.db('scheduling_App');

    await db.collection('services').updateOne(
        { _id: new ObjectId(id) },
        { $set: { active: false, deletedAt: new Date() } }
    );

    revalidatePath('/admin/services');
    revalidatePath('/clients');
}

export async function getServices() {
    const client = await clientPromise;
    const db = client.db('scheduling_App');

    // Traemos todos los servicios para que el Admin los vea todos
    const services = await db.collection('services').find({}).toArray();

    // Importante: Convertir los ObjectIds a strings para evitar errores de serialización
    return JSON.parse(JSON.stringify(services));
}

export async function notifyClientReschedule(to: string, service: string, oldDate: string, newDate: string, newTime: string) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASS
            }
        });

        await transporter.sendMail({
            from: `"Ariel Tech" <${process.env.GMAIL_USER}>`,
            to: to,
            subject: ` Appointment Update: ${service}`,
            html: `
<div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
    <div style="background-color: #000; padding: 40px; text-align: center;">
        <h2 style="color: #ea580c; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 10px;">Schedule Update</h2>
        <h1 style="color: white; font-size: 24px; text-transform: uppercase; margin: 0; italic; font-weight: 900;">Your appointment has been moved</h1>
    </div>
    <div style="padding: 40px; background-color: #fff;">
        <p style="font-size: 14px; color: #666; line-height: 1.6;">Hello, we have updated the time for your <strong>${service}</strong> service to ensure the best attention.</p>
        
        <div style="margin: 30px 0; border-left: 4px solid #ea580c; padding-left: 20px;">
            <p style="font-size: 12px; color: #999; text-transform: uppercase; margin-bottom: 5px;">New Schedule</p>
            <p style="font-size: 18px; font-weight: bold; color: #000; margin: 0;">${newDate}</p>
            <p style="font-size: 18px; font-weight: bold; color: #ea580c; margin: 0;">${newTime}:00</p>
        </div>

        <p style="font-size: 11px; color: #aaa; text-transform: uppercase; letter-spacing: 1px;">Previous date: ${oldDate}</p>
        
        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
            <p style="font-size: 10px; font-weight: bold; color: #000; text-transform: uppercase;">Ariel Tech • Secure Booking System</p>
        </div>
    </div>
</div>
`
        });
        console.log(`✅ Notification sent to ${to}`);
    } catch (error) {
        console.error('Error notifying client:', error);
    }
}