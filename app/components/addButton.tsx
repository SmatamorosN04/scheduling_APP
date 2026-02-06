'use client'
import { useState } from 'react';
import { seedServices } from '@/lib/seedService';

export default function SeedButton() {
    const [status, setStatus] = useState<{ message: string; type: 'idle' | 'loading' | 'success' | 'error' }>({
        message: '',
        type: 'idle'
    });

    const handleSeed = async () => {
        if (!confirm("¿Seguro que quieres inicializar los servicios? Si ya existen, podría dar error.")) return;

        setStatus({ message: 'Conectando con la base de datos...', type: 'loading' });

        try {
            const res = await seedServices();
            if (res.success) {
                setStatus({
                    message: `✅ ¡Éxito! Se insertaron ${res.inserted} servicios.`,
                    type: 'success'
                });
            } else {
                setStatus({ message: `❌ Error: ${res.error}`, type: 'error' });
            }
        } catch (error) {
            setStatus({ message: '❌ Error crítico en el servidor.', type: 'error' });
        }
    };

    return (
        <div className="p-6 bg-white border-2 border-dashed border-black/20 rounded-2xl flex flex-col items-center gap-4">
            <h3 className="font-bold uppercase italic text-lg">Inicialización de Base de Datos</h3>
            <p className="text-sm text-center text-gray-500 max-w-xs">
                Esto cargará los servicios básicos (Field Analysis, Installation, Maintenance) en tu colección de MongoDB.
            </p>

            <button
                onClick={handleSeed}
                disabled={status.type === 'loading' || status.type === 'success'}
                className={`px-6 py-2 rounded-full font-black uppercase tracking-tighter transition-all 
                    ${status.type === 'loading' ? 'bg-gray-200 text-gray-400 cursor-not-allowed' :
                    status.type === 'success' ? 'bg-green-500 text-white cursor-default' :
                        'bg-black text-white hover:scale-105 active:scale-95'}`}
            >
                {status.type === 'loading' ? 'Cargando...' : status.type === 'success' ? 'Completado' : 'Ejecutar Seed'}
            </button>

            {status.message && (
                <p className={`text-xs font-bold ${status.type === 'error' ? 'text-red-500' : 'text-green-600'}`}>
                    {status.message}
                </p>
            )}
        </div>
    );
}