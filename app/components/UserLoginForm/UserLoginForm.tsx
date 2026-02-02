'use client'

import {useState} from "react";
import {useRouter} from "next/navigation";
import {loginCLient} from "@/lib/AuthActions";

export default function UserLoginForm() {
    const [identifier, setIdentifier] = useState('')
    const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        if (/^\d+$/.test(value)) {
            if (value.length === 8) {
                setIdentifier(value)
            }
        } else {
            setIdentifier(value)
        }
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setStatus('loading')

        const isEmail = identifier.includes('@');
        const isPhone = /^\d{8}$/.test(identifier);

        if (!isEmail && !isPhone){
            alert('Please entrer a valid number or email')
            return
        }

        setStatus('loading')
        const result = await loginCLient(identifier)

        if (result.success) {
            router.push('/portal')
            router.refresh()
        } else {
            setStatus('error')
            alert(result.error || 'Something went wrong')
        }
    }

    return (
        <div className='p-8  rounded-xl bg-white shadow-white flex flex-col max-w-sm mx-auto'>


            <form onSubmit={handleLogin}>
                <div>
                    <label className='mb-3 text-start font-bold'>
                        Email or Phone Number
                    </label>
                    <input
                        type='text'
                        required
                        className='w-full p-4 border-2 border-black rounded-lg mb-5 font-medium outline-none focus:bg-yellow-50'
                        placeholder='numberphone or Email'
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}

                    />
                </div>
                <button
                    type='submit'
                    disabled={status === 'loading'}
                    className='w-full bg-black text-white p-4 rounded-lg font-black uppercase hover:translate-x-1 hover:translate-y-1 hover:bg-green-700 transition-all'
                >
                    {status === 'loading' ? 'verifying' : 'Enter to your Portal'}
                </button>
            </form>
        </div>
    )
}