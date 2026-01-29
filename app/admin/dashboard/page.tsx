'use client';

import { useEffect, useState } from "react";
import { getAppointments } from "@/lib/actions";
import ArielCalendar from "@/app/components/Calendar/calendar";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";

export default function DashBoard() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await getAppointments();

                if (Array.isArray(data)) {
                    const formattedEvents = data.map((ev: any) => {
                        const startDate = new Date(ev.timestamp_start);

                        const [fHour, fMin] = ev.finish.split(':');
                        const endDate = new Date(startDate);
                        endDate.setHours(parseInt(fHour), parseInt(fMin));

                        return {
                            id: ev._id.toString(),
                            title: ev.title || "Service",
                            start: startDate,
                            end: endDate,
                            clientName: ev.clientName,
                            resource: {
                                color_hex: ev.title === 'Instalation' ? '#F28D35' : '#00C0E8',
                            }
                        };
                    });
                    setEvents(formattedEvents);
                }
            } catch (error) {
                console.error("Error cargando eventos:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchEvents();
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-[#F2EFDF] relative">
            <Header />

            <main className="flex-grow pt-20 pb-20 px-4 flex flex-col items-center">
                <div className="w-full max-w-6xl">
                    <div className="mb-6 flex justify-between items-end px-4">
                        <h2 className="text-2xl font-black uppercase tracking-tighter italic">Admin Panel</h2>
                        {!loading && (
                            <span className="text-[10px] font-bold bg-[#F2A950] text-white px-3 py-1 rounded-full uppercase shadow-sm">
                                {events.length} Citas hoy
                            </span>
                        )}
                    </div>

                    <div className="bg-white p-2 md:p-6 rounded-[32px] shadow-2xl border border-black/5 min-h-[500px] flex items-center justify-center">
                        {loading ? (
                            <div className="flex flex-col items-center gap-2">
                                <div className="w-8 h-8 border-4 border-[#F2A950] border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Actualizando Agenda...</p>
                            </div>
                        ) : (
                            <div className="w-full h-full">
                                <ArielCalendar events={events} isClientView={false} />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}