import Image from "next/image";
import Link from "next/dist/client/link";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
import ServiceCard from "@/app/components/ServiceCard/ServiceCard";
import ServiceForm from "@/app/components/ServiceForm/ServiceForm";
import BackButton from "@/app/components/BackButton/BackButton";
import UserLoginForm from "@/app/components/UserLoginForm/UserLoginForm";

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
                    <Link
                        href='/clientLogin'
                        className='bg-black w-full max-w-[280px] rounded-2xl p-4 text-white font-black uppercase text-xs tracking-[0.2em] hover:bg-orange-600 transition-all text-center shadow-lg active:scale-95'>
                        Go to the registry to request a service                    </Link>
                </section>

                <div
                    id='Services'
                    className='scroll-mt-24 w-full max-w-7xl px-4 md:px-8 flex flex-col gap-8 items-center'>

                    <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 mb-4">
                        Our Specialized Solutions
                    </h2>


                </div>
            </main>

            <Footer />
        </div>
  );
}
