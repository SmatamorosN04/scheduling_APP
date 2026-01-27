import ArielCalendar from "@/app/components/Calendar/calendar";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
import SideBar from "@/app/components/sidebar/infoContainer";
const events = [
    {
        id: 1,
        title: 'Análisis de campo',
        start: new Date(2026, 0, 27, 8, 0),
        end: new Date(2026, 0, 27, 11, 0),
        resource: {
            color_hex: '#00A81C',
        },
    },
    {
        id: 2,
        title: 'Mantenimiento Preventivo',
        start: new Date(2026, 0, 28, 14, 0), // 28 de Enero, 2026 - 2:00 PM
        end: new Date(2026, 0, 28, 16, 0),   // 4:00 PM
        resource: {
            serviceType: 'Soporte Hardware',
            color_hex: '#00C0E8',
        },
    }
];


export default function  dashBoard() {
    return(
            <div className="flex flex-row-reverse min-h-screen relative w-screen items-center justify-center bg-[#F2EFDF]  font-sans ">
                <Header/>

                <ArielCalendar events={events}
                />
               <SideBar/>


                <Footer/>

            </div>
        )


}