'use client'

import { useEffect, useState } from "react";
import {deleteAppointment, getAppointments, updateAppointment} from "@/lib/actions";
import Header from "@/app/components/header/header";
import ArielCalendar from "@/app/components/Calendar/calendar";
import moment from "moment";
import StatusController from "@/app/components/StatusController/StatusController";

export default function Dashboard() {
    const [events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const triggerRefresh = () => setRefreshCounter(prev => prev + 1);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        service: "",
        name: "",
        address:"",
        phone: "",
        date: "",
        startTime: "",
        endTime: "",
        status: ""
    })

    const Services = [
        'Field analysis',
        'Instalation',
        'Maintenance'
    ];



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
        setIsEditing(false);

        setEditForm({
            service: event.title || "nothing fetched ",
            name: event.clientName || "",
            address: event.direction || "",
            phone: event.phone_number || "",
            date: moment(event.start).format('YYYY-MM-DD'),
            startTime: moment(event.start).format('H'),
            endTime: moment(event.finish).format('H'),
            status: event.status || 'pending'
        })
    };

    const handleDelete = async () => {
        if (!selectedEvent) return;

        const confirmDelete = confirm(`¿Deseas eliminar la cita de ${selectedEvent.clientName}?`);
        if (confirmDelete) {
            const result = await deleteAppointment(selectedEvent.id);
            if (result && result.success) {
                triggerRefresh();
                setIsSidebarOpen(false);
                setSelectedEvent(null);
                loadEvents();
            } else {
                alert('Error al eliminar');
            }
        }
    };
    const AvailableHours = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

    const formatHour = (h: number) => {
        const hour = h > 12 ? h - 12 : h;
        const ampm = h >= 12 ? 'PM' : 'AM';
        return `${hour.toString().padStart(2, '0')}:00 ${ampm}`;
    };

    const handleUpdate = async () => {
        if (!selectedEvent) return;

        const appointmentId = selectedEvent.id || selectedEvent._id;

        if (!appointmentId) {
            alert("Error: No se pudo encontrar el ID de la cita.");
            return;
        }
        const formData = new FormData();
        formData.append('service', editForm.service);
        formData.append('name', editForm.name);
        formData.append('address', editForm.address);
        formData.append('phone', editForm.phone);
        formData.append('selectedDate', editForm.date);
        formData.append('startTime', editForm.startTime);
        formData.append('endTime', editForm.endTime);
        formData.append('status', editForm.status)
        try {
            const result = await updateAppointment(appointmentId, formData) as { success?: boolean; error?: string };

            if (result && result.success) {

                setSelectedEvent((prev:any) => ({
                    ...prev,
                    ...Object.fromEntries(formData),
                    title: formData.get('service'),
                    clientName: formData.get('name'),
                    direction: formData.get('address'),
                    status: editForm.status
                }));
                await loadEvents();
                triggerRefresh();
                alert('¡Cita actualizada con éxito!');
                setIsEditing(false);
                setIsSidebarOpen(false);

                await loadEvents();
            } else {
                alert(result?.error || "Ocurrió un error inesperado al actualizar");
            }
        } catch (err) {
            console.error("Error en la petición de actualización:", err);
            alert("Error de conexión al servidor");
        }
    };
    return (
        <div className='flex flex-col min-h-screen bg-[#F2EFDF] font-sans overflow-x-hidden'>
            <Header />

            <main className='flex-1 flex flex-col items-center justify-start p-4 pt-28 pb-10'>
              {/*  <div className='w-full max-w-6xl mb-8'>
                    <p className='text-xs font-black uppercase text-black/40 -tracking-tight mb-4 ml-2'>
                        Operational Pipeline
                    </p>
                    <TaskStatusView
                    appointments={events}
                    />
                </div>*/}

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

            <aside className={`fixed top-0 left-0 h-full w-full max-w-sm bg-white z-[70] shadow-[20px_0_50px_rgba(0,0,0,0.1)] transition-transform duration-300 ease-in-out p-8 flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                <div className="flex justify-between items-center mb-10">
                    <h2 className="text-2xl font-black uppercase italic tracking-tighter text-black">Details</h2>
                    <button onClick={() => setIsSidebarOpen(false)} className="text-black text-xl font-bold p-2 hover:scale-110 transition-transform">✕</button>
                </div>

                {selectedEvent && (
                    <div className="flex-grow flex flex-col overflow-y-auto pr-2 custom-scrollbar">
                        {!isEditing ? (

                            <div className="flex-grow flex flex-col">

                                <div className="mb-8 p-6 rounded-4xl border-l-10" style={{ backgroundColor: `${selectedEvent.color_hex}15`, borderColor: selectedEvent.color_hex }}>
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
                                <p className="text-[10px] font-black uppercase text-black/40 tracking-widest mb-2">Current Status Action</p>

                                <StatusController
                                    id={selectedEvent.id || selectedEvent._id}
                                    currentStatus={selectedEvent.status || 'pending'}
                                    onUpdate={() => {
                                        loadEvents();
                                        setIsSidebarOpen(false);
                                    }}
                                />
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="w-full py-4 mb-4 mt-5 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-zinc-800 transition-all active:scale-95 shadow-lg shadow-black/10"
                                >
                                    Edit Information
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div>
                                    <label className="text-[10px] font-black uppercase text-black/40 tracking-widest ml-2">Service</label>
                                  <select
                                  className="w-full p-4 rounded-2xl border-2 border-black/5 bg-gray-50 focus:border-black focus:bg-white outline-none transition-all font-bold text-sm mt-1"
                                  value={editForm.service}
                                  onChange={(e) => setEditForm({...editForm, service: e.target.value})}
                                  >
                                      {Services.map((servi) => (
                                          <option
                                              className="w-full p-4 rounded-2xl border-2 border-black/5 bg-gray-50 focus:border-black
                                              focus:bg-white outline-none transition-all font-bold text-sm mt-1"
                                              key={servi} value={servi}>
                                              {servi}
                                          </option>
                                      ))}
                                  </select>

                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-black/40 tracking-widest ml-2">Client Name</label>
                                    <input
                                        className="w-full p-4 rounded-2xl border-2 border-black/5 bg-gray-50 focus:border-black focus:bg-white outline-none transition-all font-bold text-sm mt-1"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase text-black/40 tracking-widest ml-2">Address</label>
                                    <input
                                        className="w-full p-4 rounded-2xl border-2 border-black/5 bg-gray-50 focus:border-black focus:bg-white outline-none transition-all font-bold text-sm mt-1"
                                        value={editForm.address}
                                        onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] font-black uppercase text-black/40 tracking-widest ml-2">Start</label>
                                        <select
                                            className="w-full p-4 rounded-2xl border-2 border-black/5 bg-gray-50 focus:border-black outline-none font-bold text-sm mt-1 cursor-pointer"
                                            value={editForm.startTime}
                                            onChange={(e) => setEditForm({...editForm, startTime: e.target.value})}
                                        >
                                            {AvailableHours.map((h) => (
                                                <option key={h} value={h}>
                                                    {formatHour(h)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-black uppercase text-black/40 tracking-widest ml-2">End</label>
                                        <select
                                            className="w-full p-4 rounded-2xl border-2 border-black/5 bg-gray-50 focus:border-black outline-none font-bold text-sm mt-1 cursor-pointer"
                                            value={editForm.endTime}
                                            onChange={(e) => setEditForm({...editForm, endTime: e.target.value})}
                                        >
                                            {AvailableHours.filter(h => h > parseInt(editForm.startTime)).map((h) => (
                                                <option key={h} value={h}>
                                                    {formatHour(h)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div>

                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        onClick={handleUpdate}
                                        className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-green-600 transition-all shadow-lg shadow-green-200"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-gray-200 transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-auto pt-6 border-t border-black/5">
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


