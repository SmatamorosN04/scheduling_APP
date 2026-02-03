'use server'
import clientPromise from '@/lib/mongodb'
import {SERVICE_COLORS} from "@/lib/constants";
import {ObjectId} from "bson";
import {revalidatePath} from "next/dist/server/web/spec-extension/revalidate";
import {cookies} from "next/dist/server/request/cookies";
import ALLOWED_TRANSITION, {AppointmentStatus} from "@/lib/appointment-logic";
import {decrypt} from "@/lib/session";
import nodemailer from "nodemailer";



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
                rawFinish: app.finish
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

    console.log("SESSION DEBUG:", sessionData);

    if (!sessionData) {
        return { error: "Invalid or expired session" };
    }

    const userName = formData.get('name') as string;
    const service = formData.get('service') as string;
    const userEmail = sessionData.email as string || sessionData.identifier as string;

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

        const overlapping = await db.collection('appointments').findOne({
            date: cleanDate,
            $and: [
                { start_num: { $lt: eH } },
                { finish_num: { $gt: sH } }
            ]
        });

        if (overlapping) return { error: "Horario ocupado" };

       const result =  await db.collection('appointments').insertOne({
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
            date: cleanDate,
            start: startFormatted,
            finish: finishFormatted,

            timestamp_start: `${cleanDate}T${startFormatted}:00`,
            clientName: formData.get('name'),
            direction: formData.get('address'),
            title: formData.get('service'),
            clientEmail: userEmail,
            phone_number: formData.get('phone'),
            evidence: mediaFiles,

            color_hex: SERVICE_COLORS[formData.get('service') as string] || "#39b82a",
            start_num: sH,
            finish_num: eH
        });

          if (result.insertedId && userEmail){
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
                      to: userEmail,
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

        <div style="text-align: center; margin: 30px 0;">
            <span style="background-color: #fff9db; color: #856404; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; border: 1px solid #ffeeba;">
                STATUS: PENDING
            </span>
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
        const overlapping = await db.collection('appointments').findOne({
            date: rawSelectedDate,
            _id: { $ne: new ObjectId(id) },
            $and: [
                { start_num: { $lt: eH } },
                { finish_num: { $gt: sH } }
            ]
        });

        if (overlapping) {
            return { error: "This hour is reserved by another client" };
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
            updatedAt: new Date()
        };

        const fieldsToUnset: any = {};

        if (status) {
            fieldsToUpdate.status = status;
            const now = new Date();

            fieldsToUnset.pendingAt = "";
            fieldsToUnset.startedAt = "";
            fieldsToUnset.completedAt = "";
            fieldsToUnset.cancelledAt = "";
            fieldsToUnset.noShowAt = "";

            switch (status) {
                case 'pending':
                    fieldsToUpdate.pendingAt = now;
                    delete fieldsToUnset.pendingAt;
                    break;
                case 'in-progress':
                    fieldsToUpdate.startedAt = now;
                    delete fieldsToUnset.startedAt;
                    break;
                case 'completed':
                    fieldsToUpdate.completedAt = now;
                    delete fieldsToUnset.completedAt;
                    break;
                case 'cancelled':
                    fieldsToUpdate.cancelledAt = now;
                    delete fieldsToUnset.cancelledAt;
                    break;
                case 'no-show':
                    fieldsToUpdate.noShowAt = now;
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

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        return { error: "Error al actualizar" };
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
        const fieldsToUpdate: any ={
            status: nextStatus,
            updateAt: now
        };

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

        const targetEmail = currentAppointment.clientEmail || currentAppointment.userEmail;
        const targetName = currentAppointment.userName || "Customer";

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
<div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; max-width: 600px; margin: 20px auto; color: #333; border: 1px solid #efefef; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
    
    <div style="background-color: #ffffff; padding: 30px 25px; border-bottom: 4px solid ${color}; text-align: center;">
        <h2 style="margin: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #888;">Service Update</h2>
        <h1 style="margin: 10px 0 0 0; font-size: 24px; color: #1a1a1a; font-weight: 700;">${nextStatus}</h1>
    </div>

    <div style="padding: 40px 35px; background-color: #ffffff;">
        <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5;">
            Hello <strong>${targetName}</strong>,
        </p>
        <p style="margin: 0 0 30px 0; font-size: 15px; color: #555; line-height: 1.6;">
            We are writing to inform you that the status of your service request has been updated. Below are the current details of your appointment:
        </p>

        <div style="background-color: #f9fafb; border-radius: 8px; padding: 20px; border: 1px solid #f0f0f0;">
            <table style="width: 100%; border-collapse: collapse;">
                <tr>
                    <td style="padding: 8px 0; color: #777; font-size: 13px; width: 100px;">Service</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #1a1a1a;">${currentAppointment.service}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #777; font-size: 13px;">Date</td>
                    <td style="padding: 8px 0; font-weight: 600; color: #1a1a1a;">${currentAppointment.date}</td>
                </tr>
                <tr>
                    <td style="padding: 8px 0; color: #777; font-size: 13px;">Status</td>
                    <td style="padding: 8px 0;">
                        <span style="background-color: ${color}20; color: ${color}; padding: 4px 12px; border-radius: 15px; font-size: 12px; font-weight: 700; border: 1px solid ${color}40;">
                            ${nextStatus.toUpperCase()}
                        </span>
                    </td>
                </tr>
            </table>
        </div>

        <p style="margin: 30px 0 0 0; font-size: 14px; color: #888; text-align: center; font-style: italic;">
            If you have any questions regarding this update, please feel free to contact us.
        </p>
    </div>

    <div style="background-color: #f8f9fa; padding: 25px; text-align: center; border-top: 1px solid #eee;">
        <p style="margin: 0; font-size: 12px; color: #aaa; line-height: 1.4;">
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
        }
        revalidatePath('/admin');
        return { success: true}
    } catch (error) {
        console.error("Update Error:", error);
        return { error: "Error updating status" };
    }
}

