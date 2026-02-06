'use client';
import React, {useMemo, useState} from 'react';
import {createAppointment} from "@/lib/actions";
import Link from "next/dist/client/link";
import { UploadButton } from "@/lib/uploadthing";

interface MediaFile {
    id: string;
    type: string;
}
interface ServiceFormProps {
    serviceTitle: string;
    selectedDate: Date | null;
    endDate?: Date | null;
    clientIdentifier: string
}

export default function ServiceForm({serviceTitle, selectedDate, endDate, clientIdentifier}: ServiceFormProps){
    const cleanId = useMemo(() => {
        return (clientIdentifier || "").replace(/['"]+/g, '').trim();
    }, [clientIdentifier]);

    const isPhoneLogin = useMemo(() => {
        return /^\+?\d+$/.test(cleanId) && cleanId.length > 5;
    }, [cleanId]);

    const isEmailLogin = useMemo(() => {
        return cleanId.includes('@');
    }, [cleanId]);

    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [formValues, setFormValues] = useState({
        name: '',
        address: '',
        phone: '',
        email: ''
    })

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value} = e.target;
        setFormValues(prev => ({ ...prev, [name]: value
        }))

    }

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
        <div className="w-full h-screen md:h-screen flex flex-col md:flex-row bg-white overflow-hidden">

            <div className="w-full md:w-[380px] flex-none bg-[#FDFCF7]/50 p-5 md:p-12 border-b md:border-b-0 md:border-r border-gray-100 flex flex-row md:flex-col justify-between items-center md:items-start z-10">
                <div className="flex flex-col">
                    <span className="block text-[8px] md:text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-1">Service</span>
                    <h3 className="text-sm md:text-3xl font-black uppercase italic tracking-tighter text-black leading-none">
                        {serviceTitle}
                    </h3>
                </div>

                {selectedDate && (
                    <div className="text-right md:text-left md:mt-8 md:pt-8 md:border-t md:border-black/5">
                        <span className="hidden md:block text-[10px] font-black text-orange-600 uppercase tracking-[0.3em] mb-3">Schedule</span>
                        <div className="text-[10px] md:text-xl font-bold uppercase italic text-black/80 leading-tight">
                            {selectedDate.toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            <br />
                            <span className="text-orange-600">{startTimeDisplay}:00 — {endTimeDisplay}:00</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="flex-1 relative flex flex-col min-h-0 bg-white">
                <div className="flex-1 overflow-y-auto">
                    <div className="w-full max-w-md mx-auto p-6 md:p-16">
                        <form
                            id="service-booking-form"
                            action={async (formData: FormData) => {
                                setIsPending(true);
                                setError(null);
                                formData.append('media', JSON.stringify(mediaFiles))

                                const result = await createAppointment(formData);

                                if (result && result.error) {
                                    setError(result.error);
                                    setIsPending(false);
                                } else {
                                    setIsSubmitted(true);
                                }
                            }}
                            className="space-y-8 pb-32 md:pb-10"
                        >
                            <input type="hidden" name="service" value={serviceTitle} />
                            <input type="hidden" name="selectedDate" value={selectedDate?.toISOString()} />
                            <input type="hidden" name="startTime" value={startTimeDisplay} />
                            <input type="hidden" name="endTime" value={endTimeDisplay} />
                            <input type="hidden" name="clientIdentifier" value={cleanId} />

                            <div className="space-y-6 md:space-y-10">
                                {[
                                    { label: "Full Name", name: "name", type: "text", placeholder: "Name" },
                                    { label: "Address", name: "address", type: "text", placeholder: "Location", maxLength: 150 },
                                    { label: "Contact", name: "phone", type: "tel", placeholder: "Phone" },
                                    { label: "Email", name: "email", type: "email", placeholder: "Email" }
                                ]
                                    .filter((input) => {
                                        if (input.name === "phone" && isPhoneLogin) return false;
                                        if (input.name === "email" && isEmailLogin) return false;
                                        return true;
                                    })
                                    .map((input) => (
                                        <div key={input.name} className="relative group">
                                            <label className="text-[7px] md:text-[9px] font-black text-black uppercase tracking-[0.3em] block opacity-30 mb-1">
                                                {input.label}
                                            </label>
                                            <input
                                                required
                                                type={input.type}
                                                name={input.name}
                                                placeholder={input.placeholder}
                                                maxLength={input.maxLength}
                                                value={formValues[input.name as keyof typeof formValues]}
                                                onChange={handleInputChange}
                                                className="w-full bg-transparent border-b-2 border-gray-100 text-black focus:border-black py-2 md:py-3 outline-none transition-all text-sm md:text-lg font-bold"
                                            />
                                        </div>
                                    ))}

                                <div className="pt-2">
                                    <label className="text-[7px] md:text-[10px] font-black text-black uppercase tracking-[0.3em] block opacity-30 mb-3">
                                        Evidences
                                    </label>
                                    <div className="p-4 md:p-6 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50/30">
                                        <UploadButton
                                            endpoint='serviceImageUploader'
                                            onClientUploadComplete={(res) => {
                                                if (!res) return;
                                                const newFiles: MediaFile[] = res.map(file => {
                                                    const data = file.serverData as any;
                                                    return { id: data.internalId, type: data.type };
                                                });
                                                setMediaFiles((prev) => [...prev, ...newFiles]);
                                            }}
                                            appearance={{
                                                button: "bg-black text-white font-black text-[8px] md:text-[9px] uppercase tracking-widest px-4 py-2 rounded-lg w-full",
                                                allowedContent: "hidden"
                                            }}
                                        />

                                        {mediaFiles.length > 0 && (
                                            <div className="grid grid-cols-4 gap-2 mt-4">
                                                {mediaFiles.map((file, index) => (
                                                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-black">
                                                        {file.type.startsWith('image') ? (
                                                            <img src={`/api/media/${file.id}`} className="w-full h-full object-cover opacity-80" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-[6px] text-white font-bold">VID</div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>


                            {error && (
                                <p className="text-[8px] font-bold text-red-500 uppercase text-center">{error}</p>
                            )}
                        </form>
                        <div className="
                    fixed bottom-0 left-0 right-0 p-6
                    bg-gradient-to-t from-white via-white to-transparent

                    /* Desktop: Siempre visible al final de su columna */
                    md:sticky md:bottom-0 md:p-16 md:pt-8 md:bg-white md:border-t md:border-gray-50
                    z-50
                ">
                            <button
                                form="service-booking-form"
                                type="submit"
                                disabled={isPending}
                                className={`w-full text-white font-black py-5 md:py-8 rounded-2xl md:rounded-[2.5rem] uppercase tracking-[0.3em] md:tracking-[0.5em] text-[10px] md:text-[13px] transition-all shadow-2xl ${
                                    isPending ? 'bg-gray-400' : 'bg-black hover:bg-orange-600 active:scale-95'
                                }`}
                            >
                                {isPending ? "Syncing..." : "Confirm & Request"}
                            </button>
                        </div>
                    </div>
                </div>


            </div>
        </div>
    );
}