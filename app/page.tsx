import Image from "next/image";
import Link from "next/dist/client/link";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
import ServiceCard from "@/app/components/ServiceCard/ServiceCard";
import ServiceForm from "@/app/components/ServiceForm/ServiceForm";
import BackButton from "@/app/components/BackButton/BackButton";

{/*   <Link
        href="/admin/dashboard"
       className='p-2 bg-white rounded-lg hover:cursor-pointer text-black' > Go to DashBoard</Link>

*/}

export default async function Home() {
    return (
        <div className="flex flex-col min-h-screen bg-[#F2EFDF] font-sans">
            <Header />

            <main className='flex-1 flex flex-col items-center pt-20 pb-20'>

                <section className='w-full min-h-[400px] md:h-[55vh] flex flex-col justify-center items-center bg-[#FDFBD4] text-center px-6 mb-12 shadow-inner'>
                    <h1 className='text-4xl md:text-6xl text-black font-black uppercase tracking-tighter leading-none max-w-4xl'>
                        Welcome to Ariel&apos;s <br className="hidden md:block"/> Service page
                    </h1>
                    <p className='text-base md:text-xl text-gray-600 font-medium max-w-2xl mx-auto mb-10 mt-6'>
                        Schedule your technical services quickly, securely, and professionally.
                        Select a category to get started.
                    </p>
                    <a
                        href='#Services'
                        className='bg-black w-full max-w-[280px] rounded-2xl p-4 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-orange-600 transition-all text-center shadow-lg active:scale-95'>
                        See available Services
                    </a>
                </section>

                <div
                    id='Services'
                    className='scroll-mt-24 w-full max-w-7xl px-4 md:px-8 flex flex-col gap-8 items-center'>

                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-4">
                        Our Specialized Solutions
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">

                        <Link href={`/clients/booking?service=${encodeURIComponent('Field Analysis')}`} className="h-full">
                            <ServiceCard
                                image={'/campo.png'}
                                title={'Field analysis'}
                                description={'Evaluation of physical and technical conditions, electrical infrastructure, and space to ensure maximum energy efficiency.'}
                            />
                        </Link>

                        <Link href={`/clients/booking?service=${encodeURIComponent('Instalation')}`} className="h-full">
                            <ServiceCard
                                image={'/instalation.png'}
                                title={'Installation'}
                                description={'Professional mounting, refrigerant line connection, and safety testing for optimal cooling performance.'}
                            />
                        </Link>

                        <Link href={`/clients/booking?service=${encodeURIComponent('Maintenance')}`} className="h-full">
                            <ServiceCard
                                image={'/maintenance.png'}
                                title={'Maintenance'}
                                description={'Cleaning, refrigerant checking, and electrical inspection to extend equipment lifespan and reduce breakdowns.'}
                            />
                        </Link>

                    </div>
                </div>
            </main>

            <Footer />
        </div>
  );
}
