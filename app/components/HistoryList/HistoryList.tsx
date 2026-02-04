import {getClientHistory} from "@/lib/actions";
import CancelButton from "@/app/components/cancelButton/CancellButton";
import {AppointmentStatus} from "@/lib/appointment-logic";

export default async function HistoryList({ email}: {email: string}){
    const history =await getClientHistory(email);

    return (
        <div className='bg-white border border-black rounded-lg shadow-2xl overflow-hidden' >
            {history.length > 0 ? (
                <div className='divide-y-2 divide-black/5'>
                    {history.map((item) => {
                        const canCancel = item.status === 'pending' || item.status === 'Confirmed';
                        return(
                            <div
                                key={item._id}
                                className='p-8 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50
                                transition-all group'>

                                <div className='flex items-center gap-6 '>
                                    <div className='w-16 h-16 flex items-center justify-center rounded-2xl border
                                    border-black font-black italic text-2xl shadow-md group-hover:scale-105 transition-transform'
                                    >
                                        {item.title ? item.title[0].toUpperCase() : 'S'}
                                    </div>

                                    <div>
                                        <h2 className='text-xl md:text-2xl font-black uppercase italic tracking-tighter'>
                                            {item.title}
                                        </h2>
                                        <p className='text-sm font-bold opacity-40 mt-2 uppercase tracking-widest'>
                                            {item.date} <span className='mx-1'>•</span>{item.start}
                                        </p>
                                    </div>
                                </div>

                                <div className='mt-6 md:mt-0 flex flex-col md:flex-row items-center gap-4'>
                                    {canCancel && (
                                        <CancelButton
                                        appointmentId={item._id}
                                        />
                                    )}

                                    <span className={`
                                    px-6 py-2 rounded-full text-sm font-black uppercase border-2 shadow-md
                                    ${getStatusStyles(item.status)}
                                    `}>
                                        {item.status}
                                    </span>
                                </div>

                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className='p-20 text-center'>
                    <p className='opacity-30 italic font-bold text-xl uppercase tracking-tighter'>
                        You dont request Service at moment
                    </p>
                </div>
            )}
        </div>
    );
}

function getStatusStyles(status: AppointmentStatus){
    switch (status) {
        case "Finished":
            return 'bg-green-100 border-green-600 text-green-700';
        case "Cancelled":
            return 'bg-red-50 border-red-500 text-red-600';
        case "pending":
            return 'bg-yellow-100 border-yellow-500 text-yellow-700';
        case "On-Route":
            return 'bg-blue-100 border-blue-500 text-blue-700';
        case "Confirmed":
            return 'bg-purple-100 border-purple-500 text-purple-700';
        case "In-Progress":
            return 'bg-orange-100 border-orange-500 text-orange-700';
        default: return 'bg-gray-100 border-gray-400 text-gray-600';
    }
}
