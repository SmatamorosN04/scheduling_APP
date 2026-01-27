import Image from "next/image";
import {string} from "prop-types";

interface CardProps {
    title: string;
    image: string;
    description: string;
}

export default function ServiceCard({title, image, description}:CardProps){
    return(
      <div className='group w-[90%] sm:w-[70%] h-44 relative
      border border-black/10 rounded-2xl bg-white/40 backdrop-blur-sm justify-self-center
      hover:cursor-pointer
      flex items-center p-4 gap-6 transition-all hover: shadow-lg hover:bg-[#F2EFDF]
      '>
          <div className='relative h-32 w-32 min-w-[128px] rounded-full overflow-hidden
          border-2 border-white shadow-md'>
              <Image
              className='object-cover transition-transform duration-500 group-hover:scale-110'
              src={image}
              fill
              alt='Service Image'
              />
          </div>

          <div className='flex flex-col justify-center flex-1 pr-2 overflow-hidden'>
              <h1 className='text-xl font-black text-gray-800 uppercase tracking-tight mb-1'>
                  {title}
              </h1>
              <div className='w-10 h-1 bg-black mb-2 rounded-full'></div>

              <p className='text-gray-950 text-xs md-text-sm leading-snug line-clamp-3 italic'>
                  {description}
              </p>
          </div>
      </div>
    )
}