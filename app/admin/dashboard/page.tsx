import clientPromise from "@/lib/mongodb";
import ArielCalendar from "@/app/components/Calendar/calendar";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashBoard() {
    let events: any = [];

    try {
        const client = await clientPromise;
        const db = client.db("scheduling_App");


        const rawEvents = await db.collection('appointments')
            .find({})
            .sort({ start: -1 })
            .toArray();

        events = rawEvents.map((ev: any) => ({
            id: ev._id.toString(),
            title: ev.title || "Sin nombre",
            start: new Date(ev.start),
            end: new Date(ev.finish),
            clientName: ev.clientName,
            color_hex: ev.color_hex || '#F2A950',
        }));
    } catch (error) {
        console.error('Error:', error);
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F2EFDF]">
            <Header />
            <main className="flex-grow pt-20 pb-20 px-4 flex flex-col items-center">
                <h2 className="font-black uppercase text-black mb-4">Panel de Ariel</h2>
                <div className="w-full max-w-5xl bg-white p-4 rounded-[24px] shadow-xl">
                    <ArielCalendar events={events} isClientView={false} />
                </div>
            </main>
            <Footer />
        </div>
    );
}