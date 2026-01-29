import clientPromise from "@/lib/mongodb";
import ArielCalendar from "@/app/components/Calendar/calendar";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashBoard() {
    let events: any[] = [];

    try {
        const client = await clientPromise;
        const db = client.db("scheduling_App");

        const rawEvents = await db.collection('appointments').find({}).toArray();

        events = rawEvents.map((ev: any) => {

            const startDate = new Date(ev.timestamp_start);

            const [fHour, fMin] = ev.finish.split(':');
            const endDate = new Date(startDate);
            endDate.setHours(parseInt(fHour), parseInt(fMin));

            return {
                id: ev._id.toString(),
                title: ev.title || "Mantenimiento",
                start: startDate,
                end: endDate,
                clientName: ev.clientName,
                direction: ev.direction,
                color_hex: ev.title === 'maintenance' ? '#F28D35' : '#00C0E8',
            };
        });
    } catch (error) {
        console.error('Error cargando eventos:', error);
    }

    return (
        <div className="flex flex-col min-h-screen bg-[#F2EFDF] relative">
            <Header />

            <main className="flex-grow pt-20 pb-20 px-4 flex flex-col items-center">
                <div className="w-full max-w-6xl">
                    <div className="bg-[#F2EFDF] p-4 rounded-[30px] shadow-2xl border border-black/5">
                        <ArielCalendar events={events} isClientView={false} />
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}