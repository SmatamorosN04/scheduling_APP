'use client'

import ALLOWED_TRANSITION, {AppointmentStatus} from "@/lib/appointment-logic";
import {useState} from "react";
import {updateAppointmentStatus} from "@/lib/actions";

export default function StatusController({ id, currentStatus, onUpdate}: {id: string, currentStatus: AppointmentStatus, onUpdate?: () => void}){
    const [loading, setLoading] = useState(false);

    const nextStep = ALLOWED_TRANSITION[currentStatus];

    const handleUpdate = async (next: AppointmentStatus) => {
        setLoading(true);
        const res = await updateAppointmentStatus(id, next);
        if (res.success) {
            if (onUpdate) onUpdate();
        }else {
            alert(res.error)
        }
        setLoading(false)
    };

    if (nextStep.length === 0){
        return <span className='text-gray-600 font-medium'>Proccess ended</span>
    }

    return (
        <div className='flex gap-2'>
            {nextStep.map((step) => (
                <button
                key={step}
                disabled={loading}
                onClick={() => handleUpdate(step)}
                className={`px-4 py-2 rounded-lg font-bold transition-all ${getStatusStyle(step)}`}
                >
                    {!loading ? getLabel(step) : '...'}
                </button>
            ))}
        </div>
    );
};

function getLabel(status: AppointmentStatus){
    const labels: Record<AppointmentStatus, string> = {
        'pending' : 'Pending Review',
        'Confirmed': 'confirm Request',
        'On-Route': 'On the Road',
        'In-Progress': 'working in this moment',
        'Finished': 'Finish Work',
        'Cancelled': 'Cancel request'
    };
    return  labels[status] || status ;
}

function getStatusStyle(status: AppointmentStatus){
    const styles: Record<AppointmentStatus, string> = {
         'pending' : 'bg-yellow-300 text-black hover:bg0-yellow-700',
        'Confirmed': 'bg-blue-600 text-white hover:bg-blue-700',
        'On-Route': 'bg-orange-500 text-white hover:bg-orange-700',
        'In-Progress': 'bg-purple-600 text-white hover:bg-purple-700',
        'Finished': 'bg-green-500 text-white hover:bg-green-700',
        'Cancelled': 'bg-red-200 text-red-600 hover:bg-red-700 hover:text-white'
    };
    return  styles[status] ||'bg-gray-300'
}