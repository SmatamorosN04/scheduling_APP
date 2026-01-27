import moment from "moment";

export default function CustomEvent ({ event }: {event:any})  {
    return (
        <div
            className="h-full  w-full p-2 rounded-lg shadow-md flex flex-col justify-start border-l-4 border-black/30 transition-all hover:scale-[1.02]"
            style={{ backgroundColor: event.resource?.color_hex }}
        >
            <div className="overflow-hidden">
                <p className="font-bold text-[11px] md:text-xs leading-tight uppercase truncate text-black">
                    {event.title}
                </p>

            </div>
            <div className="flex justify-evenly items-start mt-1">
         <span className="text-[9px] font-bold bg-white px-1.5 py-0.5 rounded text-black">
          {moment(event.start).format('HH:mm')}

        </span>
                <span className="text-[9px] font-bold bg-white px-1.5 py-0.5 rounded text-black">
                {moment(event.end).format('HH:mm')}
                </span>
            </div>
        </div>
    );
};