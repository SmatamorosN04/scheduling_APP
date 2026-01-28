"use client";
import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import CustomEvent from "@/app/components/Events/events";
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';


interface CalendarProps {
    events: any[];
    isClientView?: boolean
    onDateSelect?: (date: Date, end: Date) => void;
}

const localizer = momentLocalizer(moment);

export default function ArielCalendar({ events, isClientView = false, onDateSelect }: CalendarProps) {
    const [currentView, setCurrentView] = useState<any>(isClientView? Views.MONTH : Views.WEEK);
    const [isMobile, setIsMobile] = useState(false);
    const [date, setDate] = useState(new Date());

   /* useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) setCurrentView(Views.AGENDA);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, [isClientView]);*/

    /*const handleSelectSlot = (slotInfo: any) => {
        if(!isClientView) return

        if(currentView === Views.MONTH){
            setDate(slotInfo)
            setCurrentView(Views.DAY)
        }
        else if (currentView === Views.DAY || currentView === Views.WEEK) {
            if (onDateSelect) {
                onDateSelect(slotInfo.start, slotInfo.end);
            }
        }
    }*/

    return (
        <div className="h-[80vh] w-full bg-[#F2EFDF] rounded-3xl shadow-xl border border-gray-100 p-2 md:p-4">
            <Calendar
                localizer={localizer}
                events={events}
                culture='en'
                startAccessor="start"
                endAccessor="end"
                step={60}
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
                timeslots={1}
                view={currentView}
                onView={(view) => setCurrentView(view)}

                views={isClientView ? [Views.MONTH, Views.DAY] : {
                    month: true,
                    week: true,
                    day: true,
                    agenda: true
                }}

                eventPropGetter={() => ({ className: isClientView ? "!bg-gray-400 !rounded-lg !text-white h-full" : "!bg-transparent !border-0" })}

                titleAccessor={isClientView ? ()=> "Busy": "title"}

                components={{

                    event: isClientView ? undefined :  CustomEvent,
                }}

                allDayMaxRows={0}
                selectable={isClientView}
                onSelectSlot={(slotInfo) => {
                   if (!isClientView) return;

                   if (currentView === Views.MONTH){
                       setDate(slotInfo.start);
                       setCurrentView(Views.DAY);
                }
                else if (onDateSelect) {
                       onDateSelect(slotInfo.start, slotInfo.end)
                   }
                }}

                min={new Date(0, 0, 0, 8, 0, 0)}
                max={new Date(0, 0, 0, 18, 0, 0)}
                messages={{
                    next: "Next",
                    previous: "Prev",
                    today: "Today",
                    month: "Month",
                    week: "Week",
                    day: "Day",
                    agenda: "Agenda"
                }}
            />
        </div>
    );
}