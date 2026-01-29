export default function Footer() {
    return (
        <footer className="w-full h-20 bg-[#F2A950] fixed bottom-0 left-0 flex items-center justify-center z-[100] rounded-t-[24px] shadow-[0_-4px_15px_rgba(0,0,0,0.1)]">
            <div className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-white">
                   lorem ipsum
                </p>
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            </div>
        </footer>
    );
}