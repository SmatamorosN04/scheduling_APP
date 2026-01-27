import Image from "next/image";
import Link from "next/dist/client/link";
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";



export default async function Home() {
    return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Header/>
        <Link
        href="/admin/dashboard"
       className='p-2 bg-white rounded-lg hover:cursor-pointer' > Go to DashBoard</Link>
        <Footer/>
    </div>
  );
}
