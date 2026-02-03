import ALLOWED_TRANSITION, {AppointmentStatus} from "@/lib/appointment-logic";

const getStatusTheme = (status: AppointmentStatus) => {
    const themes: Record<AppointmentStatus, string> = {
        "pending": "bg-gray-50 text-gray-700 border-gray-200",
        "Confirmed": "bg-blue-50 text-blue-700 border-blue-200",
        "On-Route": "bg-purple-50 text-purple-700 border-purple-200",
        "In-Progress": "bg-orange-50 text-orange-700 border-orange-200",
        "Finished": "bg-green-50 text-green-700 border-green-200",
        "Cancelled": "bg-red-50 text-red-700 border-red-200",
    };
    return themes[status] || "bg-gray-50 text-gray-700 border-gray-200";
};

export default function TaskStatusView({appointments}: {appointments: any[]}){
    const allStatuses = Object.keys(ALLOWED_TRANSITION) as AppointmentStatus[];

    return (
        <div className="flex gap-4 p-4  min-h-20">
            {allStatuses.map((status) => {
                const filtered = appointments.filter(a => a.status === status);

                return (
                    <div key={status} className="flex-1 min-w-50 group relative">
                        <div className={`flex justify-between items-center p-3 rounded-lg border shadow-sm transition-all ${getStatusTheme(status)}`}>
                            <span className="text-xs font-black uppercase tracking-tighter">{status}</span>
                            <span className="text-xs font-bold bg-white/40 px-2 py-0.5 rounded-full shadow-inner">
                                 {filtered.length}
                            </span>
                        </div>

                        <div className="absolute top-full left-0 w-full bg-white border border-gray-200 rounded-xl shadow-2xl z-50 hidden group-hover:block animate-in fade-in slide-in-from-top-1">
                            <div className="p-2 max-h-80 overflow-y-auto">
                                {filtered.length > 0 ? (
                                    filtered.map((apt) => (
                                        <div key={apt._id || apt.id} className="p-3 mb-2 last:mb-0 border border-gray-50 rounded-lg hover:border-gray-200 hover:bg-gray-50 transition-all cursor-pointer">
                                            <p className="text-sm font-bold text-gray-800">{apt.clientName}</p>
                                            <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">{apt.title}</p>

                                            <div className="mt-3 flex flex-wrap gap-1">
                                                {ALLOWED_TRANSITION[status].map(nextStatus => (
                                                    <span key={`${apt._id}-${nextStatus}`} className="text-[9px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 border border-gray-200">
                                                       → {nextStatus}
                                                    </span>
                                                         ))}
                                            </div>
                                        </div>
                                                         ))
                                                         ) : (
                                                      <p className="p-4 text-center text-xs text-gray-400 italic">No task in this stage</p>
                                                         )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
