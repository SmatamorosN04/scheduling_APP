"use client";
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import BackButton from "@/app/components/BackButton/BackButton";
import { useEffect, useState } from "react";

export default function ArielHeader() {
    const pathname = usePathname();
    const { status } = useSession();
    const [hasClientCookie, setHasClientCookie] = useState(false);

    const isHome = pathname === '/';
    const isPortal = pathname.includes('/portal');

    useEffect(() => {
        const checkCookie = () => {
            const isClient = document.cookie
                .split('; ')
                .some(row => row.trim().startsWith('client_session='));
            setHasClientCookie(isClient);
        };
        checkCookie();
    }, []);

    return (
        <header className="flex-none w-full h-16 bg-[#F2A950] flex items-center justify-between px-6 shadow-md">
            <div className="flex-1 flex items-center">
                {!isHome ? (
                    <div className="hover:scale-105 transition-transform active:scale-95">
                        <BackButton redirection={'/'} />
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="h-1 w-1 bg-white rounded-full"></span>
                        <span className="text-white text-xs font-black uppercase tracking-[0.3em]">Ariel</span>
                    </div>
                )}
            </div>

            <div className="flex-1 flex justify-end">
                {isHome ? (
                    <div className="flex items-center gap-2">
                        {status === "authenticated" ? (
                            <Link href="/admin/dashboard" className="bg-white text-[#F2A950] px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm">
                                Dashboard
                            </Link>
                        ) : hasClientCookie ? (
                            <Link href="/portal" className="bg-white text-[#F2A950] px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all shadow-sm">
                                My Appointments
                            </Link>
                        ) : (
                            status !== "loading" && (
                                <Link href="/login" className="bg-black text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white hover:text-black transition-all shadow-sm">
                                  Admin for Login
                                </Link>
                            )
                        )}
                    </div>
                ) : (

                    status === "authenticated" && !isPortal && (
                        <button
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className="bg-white/20 hover:bg-white/40 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-lg backdrop-blur-sm transition-all border border-white/30"
                        >
                            Logout
                        </button>
                    )
                )}
            </div>
        </header>
    );
}