import Link from "next/dist/client/link";

interface BackButtonProp{
    redirection: string;

}

export default  function BackButton({redirection}: BackButtonProp){
    return(
        <Link
            className="px-6 py-2 active:scale-95 transition bg-blue-500 rounded text-white text-sm font-medium"
            href={redirection}
        > <button type="button" className="px-6 py-2 active:scale-95 transition bg-blue-500 rounded text-white text-sm font-medium">Back</button>
        </Link>

        )
}