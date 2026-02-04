import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
import Link from "next/link";
import ServiceCard from "@/app/components/ServiceCard/ServiceCard";
import LogoutClientButton from "@/app/components/LogoutClientButton/LogoutCLientButton";
import {logoutClient} from "@/lib/AuthActions";
import {Suspense} from "react";
import HistoryList from "@/app/components/HistoryList/HistoryList";
import {cookies} from "next/dist/server/request/cookies";
import {decrypt} from "@/lib/session";

export default async function Portal() {
 const coockieStore = await cookies();
 const sessionCookie = coockieStore.get('client_session');

    if (!sessionCookie) {
        return <div> Please, Log in to see your historical</div>
    }
    const sessionData = await decrypt(sessionCookie.value) as { email?: string; identifier?: string } | null;
    const email: string = sessionData?.email || sessionData?.identifier || '';


    if (!email) {
        return <div> Session invalid. Please log in again.</div>
    }

    return (
        <div className='min-h-screen flex flex-col bg-[#F2EFDF] text-black'>
            <Header />
            <div className='w-30'>
                <LogoutClientButton
                text={'logOut'}
                color={'bg-white'}
                action={logoutClient}
            /></div>

            <main className="grow max-w-7xl mx-auto w-full px-6 py-12">

                <header className="mb-8">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Request Service</span>
                    <h2 className="text-4xl font-black uppercase italic tracking-tighter">Availables Services</h2>
                </header>

                <div className="grid grid-cols-1 mb-16 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
                    <Link href={`/clients/booking?service=${encodeURIComponent('Field Analysis')}`} className="h-full">
                        <ServiceCard
                            image={'/campo.png'}
                            title={'Field analysis'}
                            description={'Evaluation of physical and technical conditions, electrical infrastructure, and space.'}
                        />
                    </Link>

                    <Link href={`/clients/booking?service=${encodeURIComponent('Installation')}`} className="h-full">
                        <ServiceCard
                            image={'/instalation.png'}
                            title={'Installation'}
                            description={'Professional mounting, refrigerant line connection, and safety testing.'}
                        />
                    </Link>

                    <Link href={`/clients/booking?service=${encodeURIComponent('Maintenance')}`} className="h-full">
                        <ServiceCard
                            image={'/maintenance.png'}
                            title={'Maintenance'}
                            description={'Cleaning, refrigerant checking, and electrical inspection to extend equipment lifespan.'}
                        />
                    </Link>
                </div>

                <header className='mb-8'>
                    <span className='text-sm font-black uppercase tracking-tighter text-black/40'>My historical request</span>
                    <h2 className='text-4xl font-black uppercase italic tracking-tighter'>Service history</h2>
                </header>

                <Suspense fallback={<div className="p-10 border-2 border-dashed border-black/20 rounded-[40px] text-center font-bold italic opacity-50">Loading history...</div>}>
                    <HistoryList email={email} />
                </Suspense>
            </main>

            <Footer />
        </div>
    )
}