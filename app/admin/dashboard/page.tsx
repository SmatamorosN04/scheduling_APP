import ArielCalendar from "@/app/components/Calendar/calendar";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
import SideBar from "@/app/components/sidebar/infoContainer";
import clientPromise from "@/lib/mongodb";
import DetailContainer from "@/app/components/DetailContainer/DetailContainer";

interface MongoDB{
    _id: number;
    service: string,
    date: string;
    start: string;
    finish: string;
    color_hex?: string;
}

export default async function  dashBoard() {

   let events:any= [];

   try {
       const client = await clientPromise;
       const db = client.db("scheduling_App")

       const rawEvents = await db.collection('appointments').find({}).toArray();

       events = rawEvents.map((ev: any) => {
           const eventDate = ev.date || ev.DATE;

           return {
               id: ev._id.toString(),
               title: ev.service || "Service without name ",
               start: new Date(`${eventDate}T${ev.start}:00`),
               end: new Date(`${eventDate}T${ev.finish}:00`),
               resource: {
                   color_hex: ev.color_hex || (ev.service === 'mantenimiento' ? '#F28D35' : '#00C0E8'),
                   serviceType: ev.service,
                   clientName: ev.clientName,
                   direction: ev.direction,
               },
           };
       })
   } catch (error){
       console.error('not loaded events', error)
   }

    return(
            <div className="flex flex-row-reverse min-h-screen relative w-screen items-center justify-center bg-[#F2EFDF]  font-sans ">
                <Header/>

                <ArielCalendar
                    events={events}
                />
                <SideBar>

                </SideBar>
                <Footer/>

            </div>
        )


};