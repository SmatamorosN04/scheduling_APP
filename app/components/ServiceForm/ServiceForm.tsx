'use client';
import React, {useState} from 'react';
import {createAppointment} from "@/lib/actions";
import Link from "next/dist/client/link";

interface ServiceFormProps {
    serviceTitle: string;
    selectedDate: Date | null;
    endDate?: Date | null;
}

export default function ServiceForm({serviceTitle, selectedDate, endDate}: ServiceFormProps){
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);

    const startTimeDisplay = selectedDate ?  selectedDate.getHours(): '0';
    const endTimeDisplay = endDate ? endDate.getHours() : "0";

    if(isSubmitted){

            return (
                <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-[40px] border border-black/5 animate-in fade-in zoom-in duration-500 max-w-sm mx-auto">
                    <div className="mb-6 flex flex-col items-center">
                        <div className="h-1 w-12 bg-orange-600 rounded-full mb-4"></div>
                        <h2 className="text-4xl font-black text-black uppercase tracking-tighter">¡Received!</h2>
                    </div>
                    <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed">
                        The booking has been <br/> saved successfully
                    </p>
                    <Link
                        href="/"
                        className="w-full bg-black text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-orange-600 transition-all active:scale-95 shadow-sm"
                    >
                        Back to Home
                    </Link>
                </div>
            );

    }
    return (
        <div className="w-full h-full flex flex-col md:flex-row animate-in fade-in slide-in-from-right-4 duration-700">

            {/* PANEL IZQUIERDO: Resumen minimalista (Ocupa el lugar de la barra lateral del calendario) */}
            <div className="w-full md:w-[350px] flex-none bg-[#FDFCF7]/50 p-8 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 flex flex-col justify-between">
                <div>


                    <div className="space-y-6">
                        <div>
                            <span className="block text-[8px] font-black text-orange-600 uppercase tracking-[0.3em] mb-3">Service</span>
                            <h3 className="text-xl sm:text-3xl font-black uppercase italic tracking-tighter text-black leading-none">
                                {serviceTitle}
                            </h3>
                        </div>

                        {selectedDate && (
                            <div>
                                <span className="block text-[8px] font-black text-orange-600 uppercase tracking-[0.3em] mb-3">Schedule</span>
                                <div className="text-xl font-bold uppercase italic text-black/80 leading-snug">
                                    {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    <br />
                                    <span className="text-orange-600">{startTimeDisplay}:00</span> — {endTimeDisplay}:00
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="hidden md:block pt-8 border-t border-gray-100">
                    <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest leading-relaxed">
                        Ariel Tech <br /> Secure Booking System
                    </p>
                </div>
            </div>

            {/* PANEL DERECHO: El Formulario Limpio */}
            <div className="flex-1 p-8 md:p-16 flex items-center justify-center overflow-y-auto scrollbar-hide">
                <div className="w-full max-w-md mx-auto">
                    <form action={async (formData: FormData) => {
                        setIsPending(true);
                        setError(null);
                        const result = await createAppointment(formData);
                        if (result && result.error) {
                            setError(result.error);
                            setIsPending(false);
                        } else {
                            setIsSubmitted(true);
                        }
                    }} className="space-y-8">

                        {/* Inputs Ocultos */}
                        <input type="hidden" name="service" value={serviceTitle} />
                        <input type="hidden" name="selectedDate" value={selectedDate?.toISOString()} />
                        <input type="hidden" name="startTime" value={startTimeDisplay} />
                        <input type="hidden" name="endTime" value={endTimeDisplay} />

                        <div className="space-y-8">
                            {[
                                { label: "Full Name", name: "name", type: "text", placeholder: "e.g. Sergio Matamoros" },
                                { label: "Complete Address", name: "address", type: "text", placeholder: "Street, number, colony..." },
                                { label: "Phone Number", name: "phone", type: "tel", placeholder: "+505 0000 0000" }
                            ].map((input) => (
                                <div key={input.name} className="relative group">
                                    <label className="text-[9px] font-black text-black uppercase tracking-[0.3em]  block opacity-30 group-focus-within:opacity-100 transition-opacity">
                                        {input.label}
                                    </label>
                                    <input
                                        required
                                        type={input.type}
                                        name={input.name}
                                        placeholder={input.placeholder}
                                        className="w-full bg-transparent border-b-2 border-gray-50 text-black focus:border-black py-3 outline-none transition-all text-base font-bold placeholder:text-gray-200 placeholder:font-normal"
                                    />
                                </div>
                            ))}
                        </div>

                        {error && (
                            <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest animate-pulse">
                                ⚠️ {error}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={isPending}
                            className={`w-full text-white font-black py-6 rounded-2xl uppercase tracking-[0.4em] text-[11px] transition-all shadow-xl shadow-black/5 ${
                                isPending
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-black hover:bg-orange-600 active:scale-[0.98]'
                            }`}
                        >
                            {isPending ? "Syncing..." : "Confirm & Request"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}