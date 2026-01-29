"use client";
import React, { useEffect, useState } from 'react';
import { Calendar, momentLocalizer, Views } from 'react-big-calendar';
import CustomEvent from "@/app/components/Events/events";
import 'moment/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import moment from 'moment-timezone';

interface CalendarProps {
    events: any[];
    isClientView?: boolean
    onDateSelect?: (date: Date, end: Date) => void;
    //onSelectEvent : (event: any) => void;
}
const formats = {
    // La columna de la izquierda (el gutter)
    timeGutterFormat: 'HH:mm',
    // La etiqueta de hora dentro de cada evento
    eventTimeRangeFormat: ({ start, end }: any, culture: any, localizer: any) =>
        localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture),
    // El formato al seleccionar un rango con el mouse
    selectRangeFormat: ({ start, end }: any, culture: any, localizer: any) =>
        localizer.format(start, 'HH:mm', culture) + ' - ' + localizer.format(end, 'HH:mm', culture),
    // Formato del día en la vista de agenda
    agendaTimeFormat: 'HH:mm',
};
moment.locale('en', {
    week: {
        dow: 1,

    }
});
moment.tz.setDefault('America/Managua');
const localizer = momentLocalizer(moment);

export default function ArielCalendar({ events, isClientView = false, onDateSelect }: CalendarProps) {
    const [currentView, setCurrentView] = useState<any>(isClientView? Views.MONTH : Views.WEEK);
    const [date, setDate] = useState(new Date());

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768 && !isClientView) {
                setCurrentView(Views.AGENDA);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isClientView]);

    return (
        <div className="h-[80vh] w-full bg-[#F2EFDF] rounded-3xl shadow-xl border border-gray-100 p-2 md:p-4">
            <Calendar
                localizer={localizer}
                events={events}
                culture='en'
                formats={formats}
                startAccessor="start"
                endAccessor="end"
                step={60}
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
                timeslots={1}
                view={currentView}
                onView={(view) => setCurrentView(view)}

                dayLayoutAlgorithm="no-overlap"
                views={isClientView ? [Views.MONTH, Views.DAY] : {
                    month: true,
                    week: true,
                    day: false,
                    agenda: true
                }}

                eventPropGetter={() => ({ className: isClientView ? "!bg-gray-400 !rounded-lg !text-white h-full" : "!bg-transparent !border-0" })}

                titleAccessor={isClientView ? ()=> "Busy": "title"}
                components={{
                    event: isClientView ? undefined :  CustomEvent,
                }}
                allDayMaxRows={0}
                popup={true}
                selectable={isClientView}
                onSelectSlot={(slotInfo) => {
                   if (!isClientView) return;

                   if (slotInfo.start.getDay() === 0) return;

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