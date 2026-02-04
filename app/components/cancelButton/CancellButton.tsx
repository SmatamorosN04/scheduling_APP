'use client'

import {useState} from "react";
import {cancelAppointmentByClient} from "@/lib/actions";
import { toast } from "@/node_modules/react-hot-toast"


export default function CancelButton ({ appointmentId}: {appointmentId: string}){
    const [isPending, setIsPending] = useState(false);

    const handleCancel = async () => {
        if(!confirm('Are your sure cancell your request ? ')) return;

        setIsPending(true);
        try{
            const res = await cancelAppointmentByClient(appointmentId);
            if(res?.success){
                toast.success('Event cancelled correctly')
            } else{
                toast.error(res?.message || 'cant cancel the request');
            }
        } catch (error){
            toast.error('error processing the request')
        }
    }

    return(
        <button
            onClick={handleCancel}
        disabled={isPending}
            className={` px-4 py-2 rounded-xl border border-black font-black text-sm uppercase italic hover:cursor-pointer transition-all ${isPending ? 'bg-gray-200 cursor-not-allowed' : 'bg-white shadow-md'} `}
        >
            {isPending ? 'Canceling...': 'Cancel request'}
        </button>
    )
}