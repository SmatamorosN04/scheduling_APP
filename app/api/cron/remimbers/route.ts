import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import nodemailer from 'nodemailer';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const isTest = searchParams.get('test') === 'true';
    const authHeader = request.headers.get('authorization');

    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && !isTest) {
        return new NextResponse('Unauthorized', { status: 401 });
    }

    try {
        const client = await clientPromise;
        const db = client.db('scheduling_App');

        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setDate(start.getDate() + 7);
        end.setHours(23, 59, 59, 999);

        const startDateStr = start.toISOString().split('T')[0];
        const endDateStr = end.toISOString().split('T')[0];

        const jobs = await db.collection('appointments').find({
            status: { $in: ['Confirmed', 'pending'] },
            date: { $gte: startDateStr, $lte: endDateStr }
        }).sort({ date: 1, start: 1 }).toArray();

        if (jobs.length === 0) {
            return NextResponse.json({ message: "No pending or confirmed jobs found." });
        }

        const tableRows = jobs.map(job => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${job.date}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${job.start}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                    <strong style="color: #1a1a1a;">${job.userName || job.clientName}</strong><br>
                    <span style="color: #666; font-size: 12px;"> ${job.phone_number || 'N/A'}</span>
                </td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">${job.title}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee; font-size: 13px;">${job.direction || 'Not specified'}</td>
                <td style="padding: 12px; border-bottom: 1px solid #eee;">
                    <span style="background-color: ${job.status === 'Confirmed' ? '#e6f4ea' : '#fff4e5'}; 
                                 color: ${job.status === 'Confirmed' ? '#1e7e34' : '#b05d00'}; 
                                 padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 11px;">
                        ${job.status.toUpperCase()}
                    </span>
                </td>
            </tr>
        `).join('');

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_PASS }
        });


        await transporter.sendMail({
            from: `"Ariel's Scheduling System" <${process.env.GMAIL_USER}>`,
            to: 'sergio.matampros12@gmail.com',
            subject: ` Weekly Schedule: ${jobs.length} Appointments Found`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; color: #333;">
                    <h2 style="color: #1a1a1a; border-bottom: 2px solid #eee; padding-bottom: 10px;">Weekly Service Briefing</h2>
                    <p>Hello Ariel, here is the summary of <strong>Pending</strong> and <strong>Confirmed</strong> jobs for the next 7 days (${startDateStr} to ${endDateStr}):</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin-top: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                        <thead>
                            <tr style="background-color: #f8f9fa; text-align: left; border-bottom: 2px solid #dee2e6;">
                                <th style="padding: 12px;">Date</th>
                                <th style="padding: 12px;">Time</th>
                                <th style="padding: 12px;">Customer</th>
                                <th style="padding: 12px;">Service</th>
                                <th style="padding: 12px;">Address</th>
                                <th style="padding: 12px;">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${tableRows}
                        </tbody>
                    </table>
                    
                    <div style="margin-top: 30px; padding: 20px; background-color: #f1f3f5; border-radius: 8px; text-align: center;">
                        <p style="margin: 0; font-size: 14px; color: #495057;">
                            Total appointments this week: <strong>${jobs.length}</strong>
                        </p>
                        <p style="margin: 5px 0 0 0; font-size: 12px; color: #868e96;">
                            Generated automatically by your Scheduling App.
                        </p>
                    </div>
                </div>
            `
        });

        return NextResponse.json({ success: true, count: jobs.length });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Failed to send weekly summary" }, { status: 500 });
    }
}