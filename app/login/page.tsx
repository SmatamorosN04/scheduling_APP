'use client'
import {useState} from "react";
import {signIn} from "next-auth/react";
import { useRouter } from 'next/navigation';
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";



export default function LoginAdmin(){
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const router = useRouter()


    const handleSubmit = async (e: React.FormEvent)=> {
        e.preventDefault()
        setError(false)

        const result = await signIn('credentials', {
            username, password, redirect:false,
        });
        if (result?.ok){
            router.push('/admin/dashboard');
            router.refresh();
        }else {
            setError(true)
        }
    };

    return(
       <div className='min-h-screen flex items-center justify-center bg-[#F2EFDF] p-4'>
           <Header/>
           <div className='w-full max-w-100 bg-white rounded-xl p-10 shadow-sm border border-black/4' >
               <header className='mb-10 text-center'>
                   <h1 className='text-3xl font-black text-black uppercase tracking-tighter leading-snug'>
                       Admin Access
                   </h1>
               </header>
                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div className='space-y-2'>
                        <label className='text-sm font-black uppercase tracking-widest  text-gray-400 ml-4'>Username</label>
                        <input
                        required
                        type='text'
                        placeholder='Ariel (really its not the user)'
                        className='w-full bg-gray-300/50 border-2 border-transparent text-black focus:border-black p-5 rounded-lg outline-none transition-all font-medium'
                        onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className='space-y-2'>
                        <label className='text-sm font-black uppercase tracking-widest text-gray-400 ml-4'>Password</label>
                        <input
                            required
                            type='password'
                            placeholder='12345 (really its not the password)'
                            className='w-full bg-gray-300/50 border-2 border-transparent text-black focus:border-black p-5 rounded-lg outline-none transition-all font-medium'
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    {error && (
                    <div className='bg-white/50 border border-red-700 text-red-600  h-min p-1 '>
                        <p className='text-lg font-semibold text-center '> error, access denied </p>
                    </div>
                )}
                    <button type='submit' className='p-3 justify-self-center bg-black w-auto rounded-lg h-auto text-white hover:cursor-pointer hover:-translate-y-1 hover:scale-110 hover:bg-green-500'>Enter</button>
                </form>



           </div>
           <Footer/>
       </div>
    )
}