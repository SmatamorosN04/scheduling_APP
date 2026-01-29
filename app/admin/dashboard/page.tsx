import clientPromise from "@/lib/mongodb";
import ArielCalendar from "@/app/components/Calendar/calendar";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashBoard() {


    let events: string | any[] = [];

    try {
        const client = await clientPromise;
        const db = client.db("scheduling_App");

        const rawEvents = await db.collection('appointments')
            .find({})
            .sort({ start: 1 })
            .toArray();

        events = rawEvents.map((ev: any) => ({
            id: ev._id.toString(),
            title: ev.service || ev.title || "Cita",
            start: new Date(ev.start),
            end: new Date(ev.finish),
            clientName: ev.clientName,
            service: ev.service,
            color_hex: ev.color_hex || (ev.service === 'maintenance' ? '#F28D35' : '#00C0E8'),
        }));
    } catch (error) {
        console.error('Error cargando eventos:', error);
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F2EFDF] font-sans">
            <Header />

            <main className="flex-1 flex flex-col items-center justify-start p-4 md:p-10">
                <div className="w-full max-w-6xl">
                    <header className="mb-8 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-black">
                                Agenda de Ariel
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400">
                                Panel de Administración
                            </p>
                        </div>
                        <div className="bg-white px-4 py-2 rounded-2xl border border-black/5 shadow-sm">
                            <span className="text-xs font-black">{events.length} appointments</span>
                        </div>
                    </header>

                    <div className="bg-white p-2 md:p-6 rounded-[40px] shadow-2xl shadow-black/5 border border-black/5">
                        <ArielCalendar
                            events={events}
                            isClientView={false}
                        />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}