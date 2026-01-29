'use client'

import {useEffect, useState} from "react";
import {deleteAppointment, getAppointments} from "@/lib/actions";
import Header from "@/app/components/header/header";
import ArielCalendar from "@/app/components/Calendar/calendar";
import DetailContainer from "@/app/components/DetailContainer/DetailContainer";

export default function Dashboard(){
    const[events, setEvents] = useState<any[]>([]);
    const [selectedEvent, setSelectedEvents] = useState<any>(null)
    const [loading, setLoading] = useState(true);

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
        setSelectedEvents(null)
        loadEvents();
    },[]);

    const handleDelete = async () => {
        if (!selectedEvent) return;

        const confirmDelete = confirm(`U want to delete the booking of ${selectedEvent.clientName}`);
        if (confirmDelete) {
            const result = await deleteAppointment(selectedEvent.id);
            if(result &&  result.success){
                setSelectedEvents(null);
                loadEvents();
            }else{
                alert('Error deleting')
            }
        }
    };

    return (
        <div className='flex flex-col min-h-screen bg-[#F2EFDF] font-sans'>
            <Header/>
            <main className='flex-1 flex flex-col items-center justify-center p-4 pt-24 pb-20 relative'>
                <div className='w-full max-w-6xl bg-white p-6 rounded-lg shadow-sm border border-black'>
                    {loading ? (
                        <div className='h-[60vh] flex items-center justify-center text-black '> Loading Agenda....</div>
                    ) : (
                        <ArielCalendar
                            events={events}
                            isClientView={false}
                        />
                    )}
                </div>

            </main>

        </div>
    )


}