import moment from "moment";

export default function CustomEvent({ event }: { event: any }) {
    return (
        <div
            className="h-full w-full p-2 rounded-md flex flex-col justify-start border-l-[4px] border-black/20 overflow-hidden"
            style={{ backgroundColor: event.color_hex || '#3174ad' }}
        >
            <div className="flex flex-col gap-0.5">
                <div className='flex flex-raw gap-2'>
                    <h1 className="font-bold text-[10px] md:text-[11px] leading-none uppercase truncate text-black/90">
                    {event.title}
                    </h1>

                </div>
                <h1 className="font-bold text-[10px] md:text-[11px] leading-none uppercase truncate text-black/90">
                {event.clientName}
            </h1>
                <h1 className="font-bold text-[10px] md:text-[11px] leading-none uppercase truncate text-black/90">
                    {event.direction}
                </h1>

                <p className="text-[9px] md:text-[10px] font-medium text-black/70 truncate tracking-tight">
                    {moment(event.start).format('h:mm')} - {moment(event.end).format('h:mm A')}
                </p>
            </div>
        </div>
    );
}