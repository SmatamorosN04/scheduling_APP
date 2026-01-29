'use client'

import { useEffect, useState } from "react";
import { deleteAppointment, getAppointments, updateAppointment } from "@/lib/actions"; // Asegúrate de tener updateAppointment
import Header from "@/app/components/header/header";
import ArielCalendar from "@/app/components/Calendar/calendar";
import moment from "moment";

export default function Dashboard() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // ESTADOS PARA EDICIÓN
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ title: '', clientName: '', direction: '' });

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
        setEditData({
            title: event.title,
            clientName: event.clientName || '',
            direction: event.direction || ''
        });
        setIsEditing(false);
        setIsSidebarOpen(true);
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        const result = await updateAppointment(selectedEvent.id, editData);
        if (result?.success) {
            setIsSidebarOpen(false);
            loadEvents();
        } else {
            alert('Error updating appointment');
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent) return;
        if (confirm(`¿Eliminar cita de ${selectedEvent.clientName}?`)) {
            const result = await deleteAppointment(selectedEvent.id);
            if (result?.success) {
                setIsSidebarOpen(false);
                loadEvents();
            }
        }
    };

    return (
        <div className='flex flex-col min-h-screen bg-[#F2EFDF] font-sans overflow-hidden'>
            <Header />

            <main className='flex-1 flex flex-col items-center justify-center p-4 pt-24 pb-20 relative'>
                <div className='w-full max-w-6xl bg-white p-6 rounded-[32px] shadow-sm border border-black/5'>
                    {!loading ? (
                        <ArielCalendar
                            events={events}
                            onSelectEvent={handleSelectEvent}
                        />
                    ) : (
                        <div className='h-[60vh] flex items-center justify-center'>Cargando...</div>
                    )}
                </div>
            </main>

            {/* OVERLAY */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            {/* SIDEBAR IZQUIERDA (Left Sidebar) */}
            <aside className={`fixed top-0 left-0 h-full w-full max-w-sm bg-white z-50 shadow-[20px_0_50px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out p-8 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter">
                        {isEditing ? 'Edit Event' : 'Details'}
                    </h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="font-bold">✕</button>
                </div>

                {selectedEvent && (
                    <div className="flex-grow flex flex-col">
                        {!isEditing ? (
                            /* VISTA DE DETALLES */
                            <>
                                <div className="p-6 rounded-3xl border-l-[10px] mb-8" style={{ backgroundColor: `${selectedEvent.color_hex}15`, borderColor: selectedEvent.color_hex }}>
                                    <h3 className="text-xl font-black uppercase mb-4">{selectedEvent.title}</h3>
                                    <p className="text-sm font-bold mb-2">👤 {selectedEvent.clientName}</p>
                                    <p className="text-xs text-black/60 italic mb-4">📍 {selectedEvent.direction}</p>
                                    <span className="text-[10px] font-black bg-black text-white px-3 py-1 rounded-full">
                                        {moment(selectedEvent.start).format('hh:mm A')}
                                    </span>
                                </div>
                                <div className="mt-auto space-y-4">
                                 {/* //  <button onClick={() => setIsEditing(true)} className="w-full py-4 bg-black text-white rounded-2xl font-black uppercase text-xs">Edit</button>*/}
                                    <button onClick={handleDelete} className="w-full py-4 text-red-500 font-black uppercase text-xs">Delete</button>
                                </div>
                            </>
                        ) : (
                            /* FORMULARIO DE EDICIÓN */
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase opacity-40 ml-2">Title</label>
                                    <input
                                        className="w-full bg-gray-100 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-black transition-all"
                                        value={editData.title}
                                        onChange={e => setEditData({...editData, title: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase opacity-40 ml-2">Client</label>
                                    <input
                                        className="w-full bg-gray-100 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-black transition-all"
                                        value={editData.clientName}
                                        onChange={e => setEditData({...editData, clientName: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase opacity-40 ml-2">Direction</label>
                                    <input
                                        className="w-full bg-gray-100 p-4 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-black transition-all"
                                        value={editData.direction}
                                        onChange={e => setEditData({...editData, direction: e.target.value})}
                                    />
                                </div>
                                <div className="pt-4 space-y-3">
                                    <button type="submit" className="w-full py-4 bg-green-500 text-white rounded-2xl font-black uppercase text-xs shadow-lg shadow-green-200">Save Changes</button>
                                    <button type="button" onClick={() => setIsEditing(false)} className="w-full py-4 bg-gray-100 text-black rounded-2xl font-black uppercase text-xs">Cancel</button>
                                </div>
                            </form>
                        )
                        }
                    </div>
                )}
            </aside>
        </div>
    )
}