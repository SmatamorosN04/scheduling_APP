'use client';
import React, {useState} from 'react';
import {createAppointment} from "@/lib/actions";


interface  ServiceFormProps {
    serviceTitle: string;
    selectedDate: Date | null;
    endDate?: Date | null;
}

export default function ServiceForm({serviceTitle, selectedDate, endDate}: ServiceFormProps){
    const [isSubmitted, setIsSubmitted] = useState(false);

    const startTimeDisplay = selectedDate?.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    const endTimeDisplay = endDate?.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });


    if(isSubmitted){
        return (
            <div className="text-center p-10 bg-white rounded-[32px] shadow-xl">
                <div className="text-5xl text-black mb-4">check</div>
                <h2 className="text-2xl font-black text-black mb-4 uppercase">¡Recibido!</h2>
                <p className="text-gray-500 mb-6">the booking has been saved</p>
                <button

                    className="bg-black text-white px-6 py-2 rounded-full font-bold text-xs uppercase hover:cursor-pointer hover:bg-red-700 hover:scale-95 transition-transform"
                >
                    Back to select Service
                </button>
            </div>
        );
    }


    return(
        <div className="w-full max-w-md bg-white rounded-4xl p-8 shadow-2xl border border-black/5 animate-in fade-in zoom-in duration-300">
            <button
                type='button'
                className="group flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-black transition-colors mb-6"
            >
                <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
                Back To Service
            </button>

            <div className="mb-8">
                <h2 className="text-3xl font-black text-gray-900 leading-tight uppercase">Request For</h2>
                <span className="text-black font-black text-xl uppercase tracking-tighter">{serviceTitle}</span>
                {selectedDate && (
                    <p className="text-[10px] font-bold text-gray-500 mt-2 uppercase tracking-widest">
                        Selected Date: {selectedDate.toLocaleDateString('es-ES')}
                    </p>
                )}
            </div>

            <form action={async (formData: FormData) => {
                await createAppointment(formData);
                setIsSubmitted(true);
            }} className="space-y-5">

                <input type="hidden" name="service" value={serviceTitle} />
                <input type="hidden" name="selectedDate" value={selectedDate?.toISOString()} />
                <input type="hidden" name="startTime" value={startTimeDisplay} />
                <input type="hidden" name="endTime" value={endTimeDisplay} />

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-900 uppercase ml-2 tracking-widest">Add Your Name</label>
                    <input required type="text" name='name' placeholder="Ej. Sergio Matamoros" className="w-full bg-[#F2EFDF]/50 border-2 border-transparent text-black  focus:border-black focus:bg-white p-4 rounded-2xl outline-none transition-all text-sm font-semibold" />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-900 uppercase ml-2 tracking-widest">Your Complete Address</label>
                    <input required type="text" placeholder="street, number and colony" name='address' className="w-full bg-[#F2EFDF]/50 border-2 border-transparent text-black focus:border-black focus:bg-white p-4 rounded-2xl outline-none transition-all text-sm font-semibold" />
                </div>

                <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-gray-900 uppercase ml-2 tracking-widest">Phone Number</label>
                    <input required type="tel" placeholder="+505 0000 0000" name='phone' className="w-full bg-[#F2EFDF]/50 border-2 border-transparent focus:border-black text-black focus:bg-white p-4 rounded-2xl outline-none transition-all text-sm font-semibold" />
                </div>

                <button type="submit" className="w-full bg-black text-white font-black py-5 rounded-2xl mt-4 uppercase tracking-[0.2em] text-xs hover:bg-green-600 active:scale-95 transition-all shadow-lg shadow-black/10">
                    Confirm and Send Request
                </button>
            </form>

            <p className="text-[9px] text-center text-gray-400 mt-6 uppercase font-medium">
                By confirming, you agree to send encrypted personal information
            </p>
        </div>
    )
}