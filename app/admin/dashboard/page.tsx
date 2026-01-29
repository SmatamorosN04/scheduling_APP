'use client'

import { useEffect, useState } from "react";
import { deleteAppointment, getAppointments } from "@/lib/actions";
import Header from "@/app/components/header/header";
import ArielCalendar from "@/app/components/Calendar/calendar";
import moment from "moment";

export default function Dashboard() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const loadEvents = async () => {
        try {
            const fetchedEvents = await getAppointments();
            setEvents(fetchedEvents);
        } catch (error) {
            console.error("Error loading events:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadEvents();
    }, []);

    const handleSelectEvent = (event: any) => {
        setSelectedEvent(event);
        setIsSidebarOpen(true);
    };

    const handleDelete = async () => {
        if (!selectedEvent) return;

        const confirmDelete = confirm(`¿Deseas eliminar la cita de ${selectedEvent.clientName}?`);
        if (confirmDelete) {
            const result = await deleteAppointment(selectedEvent.id);
            if (result && result.success) {
                setIsSidebarOpen(false);
                setSelectedEvent(null);
                loadEvents();
            } else {
                alert('Error al eliminar');
            }
        }
    };

    return (
        <div className='flex flex-col min-h-screen bg-[#F2EFDF] font-sans overflow-x-hidden'>
            <Header />

            <main className='flex-1 flex flex-col items-center justify-start p-4 pt-28 pb-10'>
                {/* Contenedor del Calendario con overflow-visible para no cortar bordes */}
                <div className='w-full max-w-6xl bg-white p-4 md:p-8 rounded-[40px] shadow-sm border border-black/5'>
                    {loading ? (
                        <div className='h-[70vh] flex items-center justify-center text-black font-black uppercase tracking-widest'>
                            Loading Agenda...
                        </div>
                    ) : (
                        <ArielCalendar
                            events={events}
                            isClientView={false}
                            onSelectEvent={handleSelectEvent}
                        />
                    )}
                </div>
            </main>

            {/* OVERLAY */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* SIDEBAR IZQUIERDA */}
            <aside className={`fixed top-0 left-0 h-full w-full max-w-sm bg-white z-[70] shadow-[20px_0_50px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out p-8 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-black">Details</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-black text-xl font-bold p-2 hover:scale-110 transition-transform">✕</button>
                </div>

                {selectedEvent && (
                    <div className="flex-grow flex flex-col">
                        <div className="mb-8 p-6 rounded-[32px] border-l-[10px]" style={{ backgroundColor: `${selectedEvent.color_hex}15`, borderColor: selectedEvent.color_hex }}>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-black/30">Appointment</span>
                            <h3 className="text-xl font-black uppercase leading-tight mt-1 mb-6">{selectedEvent.title}</h3>

                            <div className="space-y-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">Client</p>
                                    <p className="text-sm font-bold text-black">{selectedEvent.clientName || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase text-black/40 tracking-widest">Location</p>
                                    <p className="text-xs font-medium text-black/70 italic">{selectedEvent.direction || 'No direction provided'}</p>
                                </div>
                                <div className="pt-4">
                                    <span className="text-[10px] font-black bg-black text-white px-4 py-2 rounded-full uppercase tracking-tighter">
                                        {moment(selectedEvent.start).format('hh:mm A')} — {moment(selectedEvent.end).format('hh:mm A')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-auto">
                            <button
                                className="w-full py-5 bg-transparent border-2 border-red-100 text-red-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
                                onClick={handleDelete}
                            >
                                Delete Appointment
                            </button>
                        </div>
                    </div>
                )}
            </aside>
        </div>
    )
}