'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginClient, verifyCodeAction } from "@/lib/AuthActions";

export default function UserLoginForm() {
    const [identifier, setIdentifier] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [step, setStep] = useState(1)
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const router = useRouter()

    const handleInitialLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')

        const cleanEmail = identifier.trim().toLowerCase();

        if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
            alert('Por favor ingresa un correo electrónico válido')
            setStatus('idle')
            return
        }

        const result = await loginClient(cleanEmail)

        if (result.success) {
            setStep(2)
            setStatus('idle')
        } else {
            setStatus('idle')
            alert('No se pudo enviar el correo. Revisa si es un destinatario autorizado.')
        }
    }

    const handleVerifyCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')

        const cleanEmail = identifier.trim().toLowerCase();
        const result = await verifyCodeAction(cleanEmail, verificationCode)

        if (result.success) {
            router.push('/portal')
            router.refresh()
        } else {
            setStatus('idle')
            alert('Código inválido o expirado')
        }
    }

    return (
        <div className='p-2 rounded-xl bg-white flex flex-col max-w-sm mx-auto shadow-lg'>
            <form onSubmit={step === 1 ? handleInitialLogin : handleVerifyCode}>
                {step === 1 ? (
                    <div>
                        <label className='mb-3 block text-start font-bold uppercase text-xs tracking-widest'>
                            Electronic Mail
                        </label>
                        <input
                            type='email'
                            required
                            className='w-full p-4 border-2 border-black rounded-lg mb-5 font-medium outline-none focus:bg-yellow-50'
                            placeholder='example@email.com'
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                        />
                        <button
                            type='submit'
                            disabled={status === 'loading'}
                            className='w-full bg-black text-white p-4 rounded-lg font-black uppercase hover:bg-gray-800 transition-all disabled:opacity-50'
                        >
                            {status === 'loading' ? 'Sending Code...' : 'Get Access'}
                        </button>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <label className='mb-3 block text-start font-bold uppercase text-xs tracking-widest text-green-600'>
                            Verifica tu Email
                        </label>
                        <p className="text-[10px] text-gray-500 mb-4">
                           A code has send to: <br/><b>{identifier.toLowerCase()}</b>
                        </p>
                        <input
                            type='text'
                            inputMode="numeric"
                            required
                            maxLength={6}
                            className='w-full p-4 border-2 border-green-500 rounded-lg mb-5 font-black text-center text-3xl tracking-[0.3em] outline-none'
                            placeholder='000000'
                            value={verificationCode}
                            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                        />
                        <button
                            type='submit'
                            disabled={status === 'loading'}
                            className='w-full bg-green-600 text-white p-4 rounded-lg font-black uppercase hover:bg-green-700 transition-all disabled:opacity-50'
                        >
                            {status === 'loading' ? 'Verifying...' : 'Get in to Portal'}
                        </button>
                        <button
                            type="button"
                            onClick={() => { setStep(1); setStatus('idle'); }}
                            className="w-full mt-4 text-sm uppercase font-bold text-gray-400 hover:text-black underline-offset-auto"
                        >
                            ¿Wrong Email? Back
                        </button>
                    </div>
                )}
            </form>
        </div>
    )
}