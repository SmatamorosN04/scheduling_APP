export const dynamic = 'force-dynamic';

import clientPromise from "@/lib/mongodb";
import ArielCalendar from "@/app/components/Calendar/calendar";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";

export default async function DashBoard() {
    let events: any[] = [];

    try {
        const client = await clientPromise;
        const db = client.db("scheduling_App");

        const rawEvents = await db.collection('appointments').find({}).toArray();

        events = rawEvents.map((ev: any) => {
            const startDateTime = new Date(`${ev.date}T${ev.start}:00`);
            const endDateTime = new Date(`${ev.date}T${ev.finish}:00`);

            return {
                id: ev._id.toString(),
                title: ev.title,
                start: startDateTime,
                end: endDateTime,
                clientName: ev.clientName || "Cliente anónimo",
                service: ev.service,
                color_hex: ev.color_hex,
            };
        });
    } catch (error) {
        console.error('Error cargando eventos:', error);
    }
    return (
        <div className="flex flex-col min-h-screen bg-[#F2EFDF] font-sans">
            <Header />
            <main className="flex-1 flex flex-col items-center justify-center p-4 pt-24 pb-20">
                <div className="w-full max-w-6xl bg-white p-6 rounded-[32px] shadow-sm border border-black/5">
                    <ArielCalendar events={events} isClientView={false} />
                </div>
            </main>
            <Footer />
        </div>
    );
}