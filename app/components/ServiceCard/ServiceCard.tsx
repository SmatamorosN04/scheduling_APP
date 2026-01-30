import Image from "next/image";
import {string} from "prop-types";

interface CardProps {
    title: string;
    image: string;
    description: string;
}

export default function ServiceCard({title, image, description}:CardProps){
    return(
        <div className='group w-[95%]  h-auto  relative
            border border-black/10 rounded-3xl bg-white/40 backdrop-blur-sm justify-self-center
            hover:cursor-pointer flex flex-col sm:flex-row items-center p-6  gap-4
            transition-all hover:shadow-2xl hover:bg-[#F2EFDF] hover:border-black/20
        '>
            <div className='relative h-32 w-32 min-w-32 sm:h-32  rounded-full overflow-hidden
                border-4 border-white shadow-xl shrink-0'>
                <Image
                    className='object-cover transition-transform duration-700 group-hover:scale-110'
                    src={image}
                    fill
                    sizes="(max-width: 768px) 128px, 128px"
                    alt={title}
                />
            </div>

            <div className='flex flex-col items-center  text-centerflex-1 overflow-hidden'>
                <h1 className='text-lg  font-black text-gray-900 uppercase tracking-tighter mb-1 leading-tight'>
                    {title}
                </h1>

                <div className='w-12 h-1 bg-black mb-3 rounded-full transition-all duration-300 group-hover:w-20'></div>

                <p className='text-gray-800 text-xs sm:text-sm leading-relaxed line-clamp-3  italic font-medium'>
                    "{description}"
                </p>
            </div>

            <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity hidden ">
                <span className="text-[10px] font-bold uppercase tracking-widest text-black/40">Details →</span>
            </div>
        </div>
    )
}