'use client'

interface TimeSlotPickerProps {
    startTime: string;
    finishTime: string;
    setStartTime: (time: string) => void;
    setFinishTime: (time: string) => void;
    occupiedSlots?: string[];
}
const timeOptions = [
    "8:00","9:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00"
    ,"18:00"
]
export default function TimeSlotPicker({ startTime, finishTime,
setStartTime, setFinishTime, occupiedSlots}: TimeSlotPickerProps)
{
    return(
        <div className='space-y-6 bg-[#f2EFDF]/30 p-4 rounded-lg border border-black/5'>

            <div className='flex flex-col gap-2'>
                <label className='text-sm font-black uppercase ml-2 tracking-widest'>
                    Select Start Time
                </label>
            <div className='grid grid-cols-4 gap-2'>
                {timeOptions.map((time) => {
                    const isOccupied = occupiedSlots?.includes(time);
                    return(
                        <button
                        key={time}
                        type='button'
                        disabled={isOccupied}
                        onClick={() => {
                            setStartTime(time)
                            setFinishTime('')
                        }}
                        className={`p-3 rounded-xl text-xs font-semibold transition-all border-2 ${
                            startTime === time ? 'bg-gray-700 text-white border-black scale-95' : isOccupied ? 'bg-gray-200 text-shadow-gray-600' +
                                ' bg-gray-200 border-transparent cursor-not-allowed' : 'bg-white border-transparent text-black hover: hover:border-black/20'
                        }`}>
                            {time}
                        </button>
                    )})}

            </div>
            </div>
            <div
            className={`flex flex-col gap-2 transition-all duration-500 ${!startTime ? "opacity-30 pointer-events-none" : "opacity-100"}`}
            >
                <label className='text-sm font-black uppercase ml-2 tracking-widest'>
                    Select Finish Time
                </label>
                <div className='grid grid-cols-4 gap-2'>
                    {timeOptions
                        .filter((t) => t > startTime)
                        .map((time) => (
                            <button
                            key={time}
                            type='button'
                            onClick={() => setFinishTime(time)}
                            className={`p-3 rounded-xl text-xs font-semibold transition-all border-2 ${
                                finishTime === time ? 'bg-gray-700 text-white border-black scale-95' :  'bg-gray-200 text-shadow-gray-600' +
                                    ' bg-gray-200 border-transparent cursor-not-allowed' 
                            }`}>
                                {time}
                            </button>
                        ))}
                </div>
            </div>

        </div>
    )
}