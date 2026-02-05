'use client'

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getAppointments } from "@/lib/actions";
import ArielCalendar from "@/app/components/Calendar/calendar";
import ServiceForm from "@/app/components/ServiceForm/ServiceForm";

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
}

export default function BookingContent({ initialIdentifier }: { initialIdentifier: string }) {
    const searchParams = useSearchParams();
    const serviceName = searchParams.get("service") || "Servicio ";

    const [events, setEvents] = useState<CalendarEvent[]>([]);

    const clientIdentifier = initialIdentifier;

    useEffect(() => {
        async function fetchEvents() {
            try {
                const data = await getAppointments();
                if (Array.isArray(data)) {
                    setEvents(data);
                } else {
                    setEvents([]);
                }
            } catch (error) {
                console.error("Error loading events:", error);
            }
        }
        fetchEvents();
    }, []);

    const [startDate, setStartDate] = useState<Date | null>(null);
    const [finishDate, setFinishDate] = useState<Date | null>(null);
    const [step, setStep] = useState(1);

    const handleDateSelect = (start: Date, end: Date) => {
        setStartDate(start);
        setFinishDate(end)
        setStep(2)
    }

    return (
        <div className="w-full h-full flex flex-col max-w-350 mx-auto animate-in fade-in duration-700">

            <div className="flex-none mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-orange-600 mb-1 block">
                        Step 0{step}
                    </span>
                    <h2 className="text-xl md:text-5xl font-black uppercase tracking-tighter italic leading-none text-black">
                        {step === 1 ? "Select Date" : "Final Details"}
                    </h2>
                </div>
                {step === 2 && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-l-2 border-gray-100 pl-4">
                        {serviceName}
                    </p>
                )}
            </div>

            <div className="flex-1 min-h-0 w-full">
                {step === 1 ? (
                    <div className="h-full bg-white rounded-[40px] border border-black/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-4 overflow-hidden">
                        <ArielCalendar
                            events={events}
                            isClientView={true}
                            onDateSelect={handleDateSelect}
                        />
                    </div>
                ) : (
                    <div className="h-full bg-white rounded-[40px] border border-black/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.02)] p-4 overflow-hidden">
                        <ServiceForm
                            key={clientIdentifier}
                            serviceTitle={serviceName}
                            selectedDate={startDate}
                            endDate={finishDate}
                            clientIdentifier={clientIdentifier}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}