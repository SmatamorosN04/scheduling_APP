'use client'
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
import ServiceForm from "@/app/components/ServiceForm/ServiceForm";
import {useSearchParams} from "next/dist/client/components/navigation";
import {Suspense, useEffect, useState} from "react";
import ArielCalendar from "@/app/components/Calendar/calendar";
import TimeSlotPicker from "@/app/components/TimeSlotPicker/TimeSlotPicker";
import {getAppointments} from "@/lib/actions";


export const dynamic = 'force-dynamic';

interface CalendarEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
}

function BookingContent() {
    const searchParams = useSearchParams();
    const serviceName = searchParams.get("service") || "Servicio ";
    const[events, setEvents] = useState<CalendarEvent[]>([]);

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
       <div>
           <h2>
               {step === 1 ? "Select Date for get a booking" : `Complete the booking: ${serviceName}`}
           </h2>
           {step ===1? (
               <div>
                   <ArielCalendar events={events}
                   isClientView={true}
                   onDateSelect={handleDateSelect}
                   />
               </div>
           ): (
               <div>
                <ServiceForm
                serviceTitle={serviceName}
                selectedDate={startDate}
                endDate={finishDate}
                />

               </div>
           )}
       </div>
    );
}

export default function Booking(){

        return (
            <div className='h-screen items-center bg-[#F2EFDF] w-full flex flex-col '>
                <Header/>
                <main className='flex-1 flex items-center justify-center p-4'>
                   <Suspense fallback={<p className="text-sm font-bold animate-pulse">Loading Booking service</p>}>
                        <BookingContent />
                   </Suspense>


                </main>
                <Footer/>
            </div>
        )
    }


