'use client'
import { useState } from "react";
import { updateAppointment } from "@/lib/actions";

interface StatusControllerProps {
    appointmentId: string;
    currentStatus: string;
    onStatusChange: () => void;
}

export default function StatusController({ appointmentId, currentStatus, onStatusChange }: StatusControllerProps) {
    const [isUpdating, setIsUpdating] = useState(false);

    const statuses = [
        { id: 'pending', label: 'Pending', color: 'bg-amber-400' },
        { id: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
        { id: 'completed', label: 'Completed', color: 'bg-emerald-500' },
        { id: 'cancelled', label: 'Cancelled', color: 'bg-red-500' },
        { id: 'no-show', label: 'No Show', color: 'bg-zinc-500' }
    ];

    const handleUpdate = async (newStatus: string) => {
        if (newStatus === currentStatus || isUpdating) return;

        setIsUpdating(true);
        try {
            const formData = new FormData();
            formData.append('status', newStatus);


            const res = await updateAppointment(appointmentId, formData);

            if (res && res.success) {
                onStatusChange();
            } else {
                console.error("Server error:", res?.error);
            }
        } catch (error) {
            console.error("Error updating status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="flex flex-col gap-3 mt-6 p-5 bg-gray-50/50 rounded-[32px] border border-black/5">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-black/20 ml-2">
                Status Control {isUpdating && "— Updating..."}
            </p>
            <div className="grid grid-cols-2 gap-2">
                {statuses.map((s) => {
                    const isActive = currentStatus === s.id;
                    return (
                        <button
                            key={s.id}
                            type="button"
                            disabled={isUpdating}
                            onClick={() => handleUpdate(s.id)}
                            className={`
                                py-3 px-2 rounded-[18px] text-[9px] font-black uppercase transition-all duration-300
                                ${isActive
                                ? `${s.color} text-white shadow-lg shadow-black/10 scale-100 ring-2 ring-offset-2 ring-black/5`
                                : 'bg-white text-black/40 border border-black/5 hover:border-black/20 opacity-60 hover:opacity-100'}
                                ${isUpdating ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-95'}
                            `}
                        >
                            {s.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}