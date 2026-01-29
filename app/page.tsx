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
        <Link
            href="/clients/selectService"
            className='p-2 bg-white rounded-lg hover:cursor-pointer text-black' > Go to select Service</Link>
*/}

export default async function Home() {
    return (
    <div className="flex min-h-screen items-center  justify-start bg-[#F2EFDF] font-sans  ">
        <Header/>

        <main className='flex-1 flex flex-col items-start mt-25  pb-20 '>

            <section className='w-full h-55 flex flex-col justify-center items-center   bg-yellow-200 text-center mb-16 '>
                <h1 className='text-3xl text-black font-black'>Welcome to Ariel's  Service's page
                </h1>
                <p className='text-lg md-text-xl text-gray-600 font-medium mx-auto mb-10 mt-5'>Schedule your technical services quickly, securely, and professionally.
                    Select a category to get started.</p>
                <a
                    href='#Services'
                    className='bg-black w-60 rounded-lg p-2'>See the available Services</a>

            </section>
            <div
                id='Services'
                className='bg-[#F2EFDF] h-auto w-full flex flex-col justify-center  items-center gap-3'>
                <Header/>

                <Link

                    href={`/clients/booking?service=${encodeURIComponent('Field Analysis')}`}>
                    <ServiceCard image={'/campo.png'} title={'Field analysis'} description={'An air conditioning installer, during the field analysis' +
                        ', is responsible for evaluating the physical and technical conditions of the location where the system will be installed' +
                        '. This includes checking the electrical infrastructure, measuring available space and ventilation, identifying potential' +
                        ' obstacles, and determining the most suitable equipment capacity to ensure energy efficiency and comfort. The installer also considers environmental factors such as' +
                        ' building orientation, sun exposure, and airflow circulation to design a solution that maximizes system performance and ' +
                        'minimizes future maintenance issues.'}/>
                </Link>

                <Link href={`/clients/booking?service=${encodeURIComponent('Instalation')}`}>
                    <ServiceCard image={'/instalation.png'} title={'Instalation'} description={`During the installation phase, an air conditioning installer is responsible for positioning
             and securing the indoor and outdoor units according to the site analysis. This involves mounting brackets, connecting refrigerant lines, and ensuring proper drainage 
             to prevent leaks. The installer also integrates the electrical wiring, verifies that the power supply meets safety standards, and configures the thermostat or control
              system. Once the system is physically installed, they perform vacuuming and refrigerant charging to guarantee optimal pressure 
            levels. Finally, the installer tests the equipment, checks airflow and cooling efficiency, and provides guidance to the client on correct usage and basic maintenance.`}/>

                </Link>

                <Link href={`/clients/booking?service=${encodeURIComponent('Maintenance')}`}>
                    <ServiceCard image={'/maintenance.png'} title={'Maintenance'} description={`During the maintenance phase, an air conditioning technician ensures that the system continues
             to operate efficiently and safely over time. This involves cleaning or replacing air filters, checking refrigerant levels, and inspecting electrical connections to prevent
              malfunctions. The technician also examines ducts and drainage lines to avoid blockages or leaks, lubricates moving parts, and verifies thermostat accuracy. Regular maintenance
               helps extend the lifespan of the equipment, improves energy efficiency, and reduces the risk of unexpected breakdowns. Finally, the technician provides recommendations to the 
               client on proper usage habits and schedules future inspections to keep the system in optimal condition.`} />
                </Link>


                <Footer/>
            </div>

        </main>

        <Footer/>


    </div>
  );
}
