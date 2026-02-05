import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
import {Suspense} from "react";
import BookingContent from "@/app/components/BookingContent/BookingContent";
import {decrypt} from "@/lib/session";
import {cookies} from "next/dist/server/request/cookies";


export const dynamic = 'force-dynamic';



export default async function Booking(){
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('client_session');
    let clientIdentifier = "";

    if (sessionCookie) {
        try {
            const sessionData = await decrypt(sessionCookie.value) as any;

            clientIdentifier = sessionData?.user || sessionData?.email || sessionData?.identifier || "";
        } catch (error) {
            console.error("Error decrypting session on server:", error);
        }
    }
    return (
        <div className='h-screen w-full flex flex-col bg-[#FDFCF7] overflow-hidden'>
            <Header />

            <main className='flex-1 min-h-0 w-full flex items-center justify-center p-4 md:p-6'>
                <Suspense fallback={
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Loading...</p>
                    </div>
                }>
                    <BookingContent initialIdentifier={clientIdentifier} />
                </Suspense>
            </main>

            <Footer />
        </div>
    );
    }


