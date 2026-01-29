export default function Footer() {
    return (
        <footer className="w-full h-14 bg-[#F2A950] fixed bottom-0 left-0 flex items-center justify-center z-[100] rounded-t-[32px] border-t border-white/20 shadow-[0_-10px_25px_-5px_rgba(0,0,0,0.1)] backdrop-blur-sm">
            <div className="flex items-center gap-4">
                <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
                <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] text-white drop-shadow-sm">
                    Ariel Tech Services
                </p>
                <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
        </span>
            </div>
        </footer>
    );
}