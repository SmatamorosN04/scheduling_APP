import {NextResponse} from "next/server";
import clientPromise from "@/lib/mongodb";
import {sendReminderEmail} from "@/lib/mail";

export async function GET(request: Request) {
    const authHeader = request.headers.get('authorization');
    if(authHeader !== `Bearer ${process.env.CRON_SECRET}`){
        return new NextResponse('Unauthorized', {status : 401});
    }

    try{
        const client = await clientPromise
        const db = client.db('scheduling_App');


        const standarHour = new Date()
        standarHour.setHours(standarHour.getHours() - 6 )


        const appointments = await db.collection('appointments ').find({
            status: 'Confirmed',
            $or: [
                {sent24h: {$ne: true}},
                {sent1h: {$ne: true}}
            ]
        }).toArray()

        let sentCount = 0;

        for (const app of appointments) {
            const appDateTime = new Date(`${app.date}T${app.start}:00`);

            const diffMs = appDateTime.getTime() - standarHour.getTime();
            const diffHours = diffMs / (1000 * 60 *60);

            if (diffHours <= 25 && diffHours >= 23 && !app.sent24h){
                await sendReminderEmail(app, "1 day");
                await db.collection('appointments').updateOne(
                    { _id: app._id },
                    { $set: { sent24h: true } }
                );
                sentCount++
            }
            if (diffHours <= 1.5 && diffHours > 0 && !app.sent1h) {
                await sendReminderEmail(app, "1 hour");
                await db.collection('appointments').updateOne(
                    { _id: app._id },
                    { $set: { sent1h: true } }
                );
                sentCount++;
            }
        }
        return NextResponse.json({
            success: true,
            message: `Process Completed. Email sended`
        })
    }
    catch (error: any){
        console.error("CRON ERROR:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}