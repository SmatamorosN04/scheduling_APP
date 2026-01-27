"use client";

import React from 'react';

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
    return (
        <div className="h-200 w-full bg-[#F2EFDF] rounded-3xl shadow-xl border border-gray-100 p-4">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                step={60}
                timeslots={1}
                defaultView={Views.WEEK}
                allDayMaxRows={0}

                views={[Views.MONTH, Views.WEEK, Views.DAY]}
                eventPropGetter={() => ({ className: "!bg-transparent !border-0" })}
                components={{
                    event: CustomEvent,
                }}
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