'use client'
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
import ServiceForm from "@/app/components/ServiceForm/ServiceForm";
import {useSearchParams} from "next/dist/client/components/navigation";
import {Suspense} from "react";


export const dynamic = 'force-dynamic';
export default function Booking(){
    const searchParams = useSearchParams();

    const serviceName = searchParams.get("service") || "Servicio ";

        return (
            <div className='h-screen items-center bg-[#F2EFDF] w-full flex flex-col '>
                <Header/>
                <main className='flex-1 flex items-center justify-center p-4'>
                   <Suspense fallback={<p className="text-sm font-bold animate-pulse">Cargando formulario...</p>}>
                       <ServiceForm
                           serviceTitle={serviceName}
                       />
                   </Suspense>


                </main>
                <Footer/>
            </div>
        )
    }


