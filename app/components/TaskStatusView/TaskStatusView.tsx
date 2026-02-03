import {useCallback, useEffect, useState} from "react";
import {getAppointments} from "@/lib/actions";
import moment from "moment";

interface TaskStatusViewProps {
    onSelectEvent: (event: any) => void;
    onStatusChange: (event: any) => void;
    refreshTrigger: number;
}

export default function TaskStatusView({ onSelectEvent, refreshTrigger}: TaskStatusViewProps){
    const [tasks, setTasks] = useState<any[]>([])
    const [loading, setLoading] = useState(true);

    const fetchTasks = useCallback(async () =>{
        setLoading(true);
        try{
            const data = await getAppointments();
            setTasks(data);
        }catch (error){
            console.error("error refreshing")
        }finally {
            setLoading(false);
        }
    },[]);

    useEffect(() => {
        fetchTasks();
    },[refreshTrigger, fetchTasks]);

    const categories = [
        { id: 'pending', title: 'Pending', color: 'border-yellow-400',
            items: tasks.filter(t => t.status === 'pending' || !t.status) },
        { id: 'in-progress', title: 'In Progress', color: 'border-blue-500',
            items: tasks.filter(t => t.status === 'in-progress') },
        { id: 'completed', title: 'Completed', color: 'border-green-500',
            items: tasks.filter(t => t.status === 'completed') }
    ];

    return (
        <aside className='w-80 hidden xl:flex flex-col gap-8 overflow-y-auto max-h-[85vh] pr-4 custom-scrollbar'>
            {loading && tasks.length === 0 ? (
                <div className="text-[10px] font-black uppercase opacity-20 animate-pulse text-center py-10">Updating list...</div>
            ) : (
                categories.map((cate) => (
                    <div key={cate.id} className='flex flex-col gap-4'>
                        <div className='flex justify-between items-center px-1'>
                            <h3 className='text-[10px] font-black uppercase tracking-widest text-black/40'>{cate.title}</h3>
                            <span className='bg-black text-white text-[10px] px-2 py-0.5 rounded-full font-black'>{cate.items.length}</span>
                        </div>

                        <div className="flex flex-col gap-3">
                            {cate.items.map((task) => (
                                <div
                                    key={task.id}
                                    onClick={() => onSelectEvent(task)}
                                    className={`group bg-white p-5 rounded-[24px] border border-black/5 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer border-l-[6px] ${cate.color}`}
                                >
                                    <h4 className="text-xs font-black uppercase leading-tight mb-1">{task.title}</h4>
                                    <p className="text-[10px] font-bold text-black/40 mb-3 italic">{task.clientName}</p>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[9px] font-black bg-gray-100 px-2 py-1 rounded-lg uppercase tracking-tighter">
                                            {moment(task.start).format('MMM DD')}
                                        </span>
                                        <span className="text-[9px] font-bold text-black/30">
                                            {moment(task.start).format('h:mm A')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </aside>
    );
}