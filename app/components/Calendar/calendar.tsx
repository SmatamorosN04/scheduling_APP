"use client";

import React, {useEffect, useState} from 'react';

import {Calendar, momentLocalizer, Views} from 'react-big-calendar';
import CustomEvent from "@/app/components/Events/events";
import moment from 'moment';
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('en', {
   week:{
       dow:1,
   }
});
const localizer = momentLocalizer(moment);

export default function ArielCalendar({ events }: { events: any[] }) {
    const [currentView, setCurrentView] = useState(Views.WEEK)
const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <768;
            setIsMobile(mobile)
            // @ts-ignore
            setCurrentView(mobile ? Views.AGENDA : Views.WEEK);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    return (
        <div className="h-[80vh] w-full bg-[#F2EFDF] rounded-3xl shadow-xl border border-gray-100 p-2 md:p-4 overflow-x-auto">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                step={60}
                timeslots={1}
                view={currentView}
                views={isMobile ? [Views.AGENDA] : [Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
                eventPropGetter={() => ({ className: "!bg-transparent !border-0" })}
                components={{
                    event: CustomEvent,
                }}
                defaultView={Views.WEEK}

                allDayMaxRows={0}

                selectable
                onSelectSlot={(slotInfo) => {
                    if(moment(slotInfo.start).day() === 0) return false;
                }}
                min={new Date(0, 0, 0, 8, 0, 0)}
                max={new Date(0, 0, 0, 19, 0, 0)}
                messages={{
                    next: "Next",
                    previous: "Prev",
                    today: "Today",
                    month: "Month",
                    week: "Week",
                    day: "Day",
                }}
            />


        </div>
    );
}