'use client';
import { usePathname } from 'next/navigation';
import { signOut } from "next-auth/react";
import BackButton from "@/app/components/BackButton/BackButton";

export default function Header() {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith('/admin');

    return (
        <div className="w-full h-16 bg-[#F2A950] sticky top-0 left-0 flex items-center justify-between px-6 z-[100] shadow-lg rounded-b-[32px] border-b border-black/5">
            <div className="flex-1">
                <div className="hover:scale-105 transition-transform active:scale-95 inline-block">
                    <BackButton redirection={'/'} />
                </div>
            </div>

            <div className="flex-1 flex justify-end">
                {isAdmin && (
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="group relative flex items-center gap-2 bg-black/10 hover:bg-black text-black hover:text-white px-5 py-2 rounded-2xl transition-all duration-300 border border-black/5 backdrop-blur-md shadow-sm"
                    >
                <span className="text-[10px] font-black uppercase tracking-widest">
                    Logout
                </span>
                        <svg
                            className="w-3 h-3 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}