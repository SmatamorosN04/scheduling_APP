import BackButton from "@/app/components/BackButton/BackButton";

export default function Header(){
    return(
        <div className="w-full h-10 bg-[#F2A950] absolute top-0 flex justify-center">
            <BackButton
            redirection={'/'}
            />
        </div>
    )
}