'use client'
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from 'next/navigation';
import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";

export default function LoginAdmin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(false);
        setLoading(true);

        const result = await signIn('credentials', {
            username, password, redirect: false,
        });

        if (result?.ok) {
            router.push('/admin/dashboard');
            router.refresh();
        } else {
            setError(true);
            setLoading(false);
        }
    };

    return (
        <div className='min-h-screen flex flex-col bg-[#F2EFDF]'>
            <Header />

            <main className='flex-grow flex items-center justify-center p-6'>
                <div className='w-full max-w-md bg-white rounded-[40px] p-8 md:p-12 shadow-2xl shadow-black/5 border border-white'>

                    <header className='mb-12 text-center'>
                        <span className='text-[10px] font-black uppercase tracking-[0.3em] text-gray-400'>Security Portal</span>
                        <h1 className='text-4xl font-black text-black uppercase tracking-tighter leading-none mt-2 italic'>
                            Admin<br/>Access
                        </h1>
                    </header>

                    <form onSubmit={handleSubmit} className='space-y-8'>
                        <div className='space-y-1'>
                            <label className='text-[11px] font-black uppercase tracking-widest text-black/40 ml-1'>
                                Username
                            </label>
                            <input
                                required
                                type='text'
                                placeholder='Enter username'
                                className='w-full bg-[#F8F8F8] border-2 border-transparent text-black focus:border-black focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-300'
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>

                        <div className='space-y-1'>
                            <label className='text-[11px] font-black uppercase tracking-widest text-black/40 ml-1'>
                                Password
                            </label>
                            <input
                                required
                                type='password'
                                placeholder='••••••••'
                                className='w-full bg-[#F8F8F8] border-2 border-transparent text-black focus:border-black focus:bg-white p-4 rounded-2xl outline-none transition-all font-bold placeholder:text-gray-300'
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        {error && (
                            <div className='bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl animate-shake'>
                                <p className='text-xs font-black uppercase tracking-tight text-red-600'>
                                    Error: Access Denied
                                </p>
                            </div>
                        )}

                        <button
                            type='submit'
                            disabled={loading}
                            className='w-full py-4 bg-black text-white rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:bg-[#F2A950] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/10'
                        >
                            {loading ? 'Authenticating...' : 'Enter Dashboard'}
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
}