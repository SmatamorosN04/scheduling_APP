export const dynamic = 'force-dynamic'; // SOLUCIÓN AL PROBLEMA DE ACTUALIZACIÓN

import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";
import clientPromise from "@/lib/mongodb";
import ArielCalendar from "@/app/components/Calendar/calendar";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
import SideBar from "@/app/components/sidebar/infoContainer";

// Definimos la interfaz para evitar errores de tipo
interface Appointment {
    id: string;
    title: string;
    start: Date;
    end: Date;
    clientName: string;
    service: string;
    color_hex: string;
}

export default async function DashBoard() {
    let events: Appointment[] = [];

    try {
        const client = await clientPromise;
        const db = client.db("scheduling_App");

        const rawEvents = await db.collection('appointments').find({}).toArray();

        events = rawEvents.map((ev: any) => {
            return {
                id: ev._id.toString(),
                title: ev.title || "Servicio sin nombre",
                start: new Date(ev.start),
                end: new Date(ev.finish),
                clientName: ev.clientName || "Cliente anónimo",
                service: ev.service,
                color_hex: ev.color_hex || (ev.service === 'maintenance' ? '#F28D35' : '#00C0E8'),
            };
        });
    } catch (error) {
        console.error('Error cargando eventos:', error);
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F2EFDF] font-sans">
            <Header />

            <main className="flex-1 flex flex-col md:flex-row-reverse items-start justify-center p-4 gap-6">
                {/* El Calendario con los datos reales */}
                <div className="w-full md:w-3/4 bg-white p-6 rounded-[32px] shadow-sm border border-black/5">
                    <ArielCalendar events={events} />
                </div>


            </main>

            <Footer />
        </div>
    );
}