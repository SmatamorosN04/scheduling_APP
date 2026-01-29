'use client';
import { usePathname } from 'next/navigation';
import { signOut } from "next-auth/react";
import BackButton from "@/app/components/BackButton/BackButton";

export default function Header() {
    const pathname = usePathname();
    const isAdmin = pathname.startsWith('/admin');

    return (
        <div className="w-full h-14 bg-[#F2A950] absolute top-0 left-0 flex items-center justify-between px-6 z-50 shadow-md rounded-b-[20px]">
            <div className="flex-1">
                <BackButton redirection={'/'} />
            </div>

            <div className="flex-1 flex justify-end">
                {isAdmin && (
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="bg-white/20 hover:bg-white/40 text-white text-[9px] font-black uppercase px-3 py-1 rounded-lg backdrop-blur-sm transition-all border border-white/30"
                    >
                        Salir
                    </button>
                )}
            </div>
        </div>
    );
}