import Image from "next/image";
import Link from "next/dist/client/link";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";



export default async function Home() {
    return (
    <div className="flex min-h-screen items-center justify-center bg-[#F2EFDF] font-sans gap-4 ">
        <Header/>
        <Link
        href="/admin/dashboard"
       className='p-2 bg-white rounded-lg hover:cursor-pointer text-black' > Go to DashBoard</Link>
        <Link
            href="/clients/selectService"
            className='p-2 bg-white rounded-lg hover:cursor-pointer text-black' > Go to select Service</Link>
        <Footer/>

    </div>
  );
}
