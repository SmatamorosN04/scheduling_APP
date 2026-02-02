
interface LogoutProps{
    text: string;
    color?: string;
    action: () => void
}

export default function LogoutClientButton({text,color = 'bg-white', action}: LogoutProps) {
    return(
      <button
      onClick={action}
     className='group relative text-sm inline-block focus:outline-none '
      >
      <span className={`absolute inset-0 translate-x-1.5 translate-y-1.5 ${color} border-2 border-gray-400 rounded-lg transition-transform group-hover:translate-y-0.5 group-hover:translate-x-0`}></span>
          <span className="relative block border-2 border-black bg-white px-8 py-3 rounded-xl font-black uppercase italic tracking-tighter group-active:bg-black group-active:text-white transition-all">
              {text}
          </span>
      </button>
    )
}