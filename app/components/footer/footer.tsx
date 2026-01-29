export default function Footer() {
    return (
        <footer className="flex-none w-full h-12 bg-[#F2A950] flex items-center justify-center  shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-4">
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">
                    Ariel Services • 2026
                </p>
                <span className="w-1.5 h-1.5 bg-white/40 rounded-full"></span>
            </div>
        </footer>
    );
}