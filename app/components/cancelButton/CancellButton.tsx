'use client'

import { useState } from "react";
import { cancelAppointmentByClient } from "@/lib/actions";
import { toast } from "react-hot-toast";

export default function CancelButton({ appointmentId }: { appointmentId: string }) {
    const [isPending, setIsPending] = useState(false);

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel your request?')) return;

        setIsPending(true);
        try {
            const res = await cancelAppointmentByClient(appointmentId);
            if (res?.success) {
                toast.success('Event cancelled correctly');
            } else {
                toast.error( 'Can\'t cancel the request');
            }
        } catch (error) {
            toast.error('Error processing the request');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <button
            onClick={handleCancel}
            disabled={isPending}
            className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl border-2 border-black font-black text-sm uppercase italic transition-all hover:scale-105 active:scale-95 ${
                isPending ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed' : 'bg-white shadow-md hover:bg-black hover:text-white cursor-pointer'
            }`}
        >
            {isPending ? (
                <>
                    <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Canceling...</span>
                </>
            ) : (
                'Cancel request'
            )}
        </button>
    );
}