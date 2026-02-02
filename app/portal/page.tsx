import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
import Link from "next/link"; // Importación estándar
import ServiceCard from "@/app/components/ServiceCard/ServiceCard";

export default function Portal() {
    // Esto es lo que luego reemplazaremos con los datos de MongoDB
    const mockHistory = [
        { id: '1', service: 'Field Analysis', date: '24 Oct 2025', status: 'En Camino' },
        { id: '2', service: 'Maintenance', date: '10 Sep 2025', status: 'Completado' },
    ];

    return (
        <div className='min-h-screen flex flex-col bg-[#F2EFDF] text-black'>
            <Header />

            <main className="flex-grow max-w-7xl mx-auto w-full px-6 py-12">

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

                <section className="mt-12">
                    <header className="mb-8">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-black/40">Service History</span>
                        <h2 className="text-4xl font-black uppercase italic tracking-tighter">Your Request</h2>
                    </header>

                    <div className="bg-white border-2 border-black rounded-[40px] shadow-[10px_10px_0px_0px_rgba(0,0,0,0.05)] overflow-hidden">
                        {mockHistory.length > 0 ? (
                            <div className="divide-y-2 divide-black/5">
                                {mockHistory.map((item) => (
                                    <div key={item.id} className="p-8 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-6">
                                            <div className="bg-[#F2EFDF] p-4 rounded-2xl border-2 border-black font-black italic">
                                                {item.service[0]}
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black uppercase italic leading-none">{item.service}</h4>
                                                <p className="text-[10px] font-bold opacity-40 mt-1 uppercase">{item.date}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4 md:mt-0">
                                            <span className={`px-6 py-2 rounded-full text-[10px] font-black uppercase border-2 
                                                ${item.status === 'Completado' ? 'bg-green-100 border-green-500 text-green-700' : 'bg-blue-100 border-blue-500 text-blue-700'}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-20 text-center opacity-30 italic font-bold">
                                No has solicitado servicios aún.
                            </div>
                        )}
                    </div>
                </section>

            </main>

            <Footer />
        </div>
    )
}