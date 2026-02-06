"use client";
import React, { useEffect, useState } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import CustomEvent from "@/app/components/Events/events";
import { format, parse, startOfWeek, getDay } from 'date-fns';
import {enUS} from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

interface CalendarProps {
    events: any[];
    isClientView?: boolean;
    onDateSelect?: (date: Date, end: Date) => void;
    onSelectEvent?: (event: any) => void;
}

const locales = {
    'en-US': enUS,
};

const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
    getDay,
    locales,
});

export default function ArielCalendar({ events, isClientView = false, onDateSelect, onSelectEvent }: CalendarProps) {
    const [currentView, setCurrentView] = useState<any>(
        isClientView ? Views.MONTH : (typeof window !== 'undefined' && window.innerWidth < 768 ? Views.AGENDA : Views.WEEK)
    );
    const [date, setDate] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            if (mobile && !isClientView && (currentView === Views.MONTH || currentView === Views.WEEK)) {
                setCurrentView(Views.AGENDA);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isClientView]);

    const availableViews = isClientView
        ? [Views.MONTH, Views.DAY]
        : {
            month: true,
            week: !isMobile,
            day: false,
            agenda: true
        };

    return (
        <div className="h-[70vh] w-full bg-[#F2EFDF] rounded-3xl shadow-xl border border-gray-100 p-2 md:p-4">
            <Calendar
                localizer={localizer}
                events={events.filter(event => event.status !== 'Cancelled')}
                culture='en-US'
                startAccessor="start"
                endAccessor="end"
                step={60}
                date={date}
                onNavigate={(newDate) => setDate(newDate)}
                timeslots={1}
                view={currentView}
                onView={(view) => setCurrentView(view)}
                dayLayoutAlgorithm="no-overlap"
                onSelectEvent={(event) => onSelectEvent && onSelectEvent(event)}
                views={availableViews}

                eventPropGetter={() => ({
                    className: isClientView ? "!bg-gray-400 !rounded-lg !text-white h-full " : "!bg-white !text-black !rounded-lg  h-full"
                })}

                titleAccessor={isClientView ? () => "Busy" : "title"}
                components={{
                    event: isClientView ? undefined : CustomEvent,
                }}
                allDayMaxRows={0}
                popup={true}
                showMultiDayTimes={true}
                selectable={isClientView}
                onSelectSlot={(slotInfo) => {
                    if (!isClientView) return;
                    if (slotInfo.start.getDay() === 0) return;

                    if (currentView === Views.MONTH) {
                        setDate(slotInfo.start);
                        setCurrentView(Views.DAY);
                    } else if (onDateSelect) {
                        onDateSelect(slotInfo.start, slotInfo.end);
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