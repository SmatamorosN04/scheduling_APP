import Header from "@/app/components/header/header";
import Footer from "@/app/components/footer/footer";

export default function Portal(){
    return(
        <div className='min-h-screen flex flex-col bg-[#F2EFDF]'>
            <Header />
            <main>Hola, the login is working correctly</main>
            <Footer />


        </div>
    )
}