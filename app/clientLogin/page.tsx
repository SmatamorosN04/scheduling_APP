import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";
import UserLoginForm from "@/app/components/UserLoginForm/UserLoginForm";

export default function ClientLoginPage(){
return (
   <div className='min-h-screen flex flex-col bg-[#F2EFDF]'>
       <Header />

       <main className='flex-grow flex items-center justify-center p-6'>
           <div className='w-full max-w-md bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-black/5 border border-white'>
               <header className='mb-1 text-center'>
                   <span className='text-[10px] font-black uppercase tracking-[0.3em] text-gray-400'>Security Portal</span>
                   <h1 className='text-4xl font-black text-black uppercase tracking-tighter leading-none mt-2 italic'>
                       Clients<br/>Access
                   </h1>
               </header>

               <UserLoginForm />
           </div>


       </main>
       <Footer />

   </div>
)
}