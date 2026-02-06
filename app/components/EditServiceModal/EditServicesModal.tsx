'use client'
import { useState } from 'react';
import { saveService, deleteService } from '@/lib/actions';

export default function EditServicesModal({ services }: { services: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingService, setEditingService] = useState<any>(null);

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        await saveService(formData);
        alert("¡Cambios guardados con éxito!");
        setEditingService(null);
        setIsOpen(false);
    };

    const handleDelete = async (id: string) => {
        if (confirm("¿Estás seguro de archivar este servicio? No aparecerá más para nuevos clientes.")) {
            await deleteService(id);
            alert("Servicio archivado.");
            setIsOpen(false);
        }
    };

    if (!isOpen) return (
        <button onClick={() => setIsOpen(true)} className="bg-black text-white px-8 py-3 rounded-full font-black uppercase italic hover:scale-105 transition">
            Manage Services Catalog
        </button>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#F2EFDF] w-full max-w-2xl rounded-[40px] p-10 shadow-2xl border-2 border-black text-black max-h-[90vh] overflow-y-auto">

                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">
                        {editingService ? 'Edit Service' : 'Current Services'}
                    </h2>
                    <button onClick={() => {setIsOpen(false); setEditingService(null)}} className="text-2xl font-black">✕</button>
                </div>

                {!editingService ? (
                    /* LISTA DE SERVICIOS */
                    <div className="space-y-4">
                        {services.map((s) => (
                            <div key={s._id} className="bg-white p-4 rounded-3xl border-2 border-black/10 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full border-2 border-black" style={{ backgroundColor: s.color_hex }} />
                                    <div>
                                        <p className="font-black uppercase text-sm italic">{s.title}</p>
                                        <p className="text-[10px] opacity-50 font-bold uppercase">{s.active ? 'Active' : 'Archived'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setEditingService(s)} className="bg-zinc-100 px-4 py-2 rounded-full text-xs font-black uppercase italic">Edit</button>
                                    {s.active && (
                                        <button onClick={() => handleDelete(s._id.toString())} className="bg-red-100 text-red-600 px-4 py-2 rounded-full text-xs font-black uppercase italic">Delete</button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <button
                            onClick={() => setEditingService({ title: '', description: '', duration_hours: 1, color_hex: '#39b82a' })}
                            className="w-full py-4 border-2 border-dashed border-black/20 rounded-3xl font-bold uppercase text-sm opacity-60 hover:opacity-100 transition"
                        >
                            + Add New Service
                        </button>
                    </div>
                ) : (
                    /* FORMULARIO DE EDICIÓN / CREACIÓN */
                    <form onSubmit={handleSave} className="flex flex-col gap-5">
                        {editingService._id && <input type="hidden" name="id" value={editingService._id.toString()} />}

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase ml-2 opacity-40">Service Title</label>
                            <input name="title" defaultValue={editingService.title} required className="p-4 rounded-2xl border-2 border-black bg-white" />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase ml-2 opacity-40">Description</label>
                            <textarea name="description" defaultValue={editingService.description} required className="p-4 rounded-2xl border-2 border-black bg-white h-24" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black uppercase ml-2 opacity-40">Duration (Hours)</label>
                                <input name="duration" type="number" defaultValue={editingService.duration_hours} className="p-4 rounded-2xl border-2 border-black bg-white" />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[10px] font-black uppercase ml-2 opacity-40">Hex Color</label>
                                <div className="flex gap-2">
                                    <input name="color" type="color" defaultValue={editingService.color_hex} className="w-full h-14 rounded-2xl border-2 border-black bg-white p-1 cursor-pointer" />
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] font-black uppercase ml-2 opacity-40">Image Path</label>
                            <input name="image" defaultValue={editingService.image} placeholder="/example.png" className="p-4 rounded-2xl border-2 border-black bg-white" />
                        </div>

                        <div className="flex gap-4 mt-6">
                            <button type="submit" className="grow bg-black text-white p-5 rounded-full font-black uppercase italic shadow-lg active:scale-95 transition">Save Service</button>
                            <button type="button" onClick={() => setEditingService(null)} className="grow border-2 border-black p-5 rounded-full font-black uppercase italic">Cancel</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}