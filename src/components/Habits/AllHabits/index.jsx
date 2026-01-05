'use client'

import { useEffect, useState, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { api } from "api";
import ProtectedAccessPage from "@/components/common/ProtectedAccessPage";
import { GripVertical } from "lucide-react";
import { MultiBackend, TouchTransition } from "dnd-multi-backend";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { createTransition } from "dnd-multi-backend";
import FullScreenLoader from "@/components/common/FullScreenLoader";
import DeleteButton from "@/components/common/DeleteButton";

const HTML5toTouch = {
  backends: [
    {
      backend: HTML5Backend,
      transition: createTransition("mouse"),
    },
    {
      backend: TouchBackend,
      options: { enableMouseEvents: true },
      transition: TouchTransition,
    },
  ],
};




const ItemTypes = { HABIT: "habit" };

function HabitRow({ habit, index, moveHabit, setRefreshData }) {
    const ref = useRef(null);
    const handleRef = useRef(null);
    const router = useRouter()

    // DROP TARGET
    const [, drop] = useDrop({
        accept: ItemTypes.HABIT,
        hover(item) {
            if (item.index !== index) {
                moveHabit(item.index, index);
                item.index = index;
            }
        },
    });

    // DRAG SOURCE — but attached ONLY to the handle
    const [{ isDragging }, drag] = useDrag({
        type: ItemTypes.HABIT,
        item: { id: habit.id, index },
        collect: monitor => ({
            isDragging: monitor.isDragging(),
        }),
    });

    drag(handleRef); // Only the handle is draggable
    drop(ref);       // Entire row is a drop 
    
    const handleDelete = (id) => {
        api.delete(`/habits/${id}/`)
        .then(res =>{ 
            console.log(res,"hello res")
            setRefreshData(prev => prev + 1)
        })
        .catch(error => console.log(error))
    }

    const handleStateToggle = (e,id) => {
        e.stopPropagation();
        api.put(`/habits/${id}/`,{...habit,is_active:!habit.is_active}) 
        .then(res =>{ 
            console.log(res,"hello res")
            setRefreshData(prev => prev + 1)
        })
        .catch(error => console.log(error))
    }

    return (
    <div
        ref={ref}
        className={`p-5 rounded-2xl bg-white border border-[#F4E1D2] relative
            shadow-sm transition-all 
            ${isDragging ? "opacity-50" : "hover:shadow-md"}`}
    >
        <div
            ref={handleRef}
            className="absolute left-3 top-1/2 -translate-y-1/2 cursor-grab 
                    active:cursor-grabbing text-gray-400"
        >
            <GripVertical size={20} />
        </div>

        <div className="pl-8 pr-20">
            <Link href={`/habits/${habit.id}/stats`}>
                <h2 className="text-xl font-semibold text-[#2E8B8B]">
                    {habit.title}
                </h2>
                <p className="text-gray-600 mt-1 text-sm">{habit.description}</p>
            </Link>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3 justify-end pr-2">
            <button
                onClick={() => router.push(`/habits/${habit.id}/edit`)}
                className="text-xs px-3 py-1 rounded-lg border border-gray-300 
                        text-gray-700 hover:bg-gray-100 transition"
            >
                Edit
            </button>
            
            <DeleteButton 
                handleOk={() => {handleDelete(habit.id)}}
                item={"habit"}
                contentAuthor={habit.user}
            />

            <button
                type="button"
                onClick={(e) => handleStateToggle(e,habit.id)}
                className={`text-xs px-3 py-1 rounded-lg transition
                    ${habit.is_active
                    ? "bg-[#2E8B8B] text-white hover:bg-[#267575]"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
                aria-pressed={habit.is_active}
                aria-label={habit.is_active ? "Deactivate habit" : "Activate habit"}
                >
                {habit.is_active ? "Deactivate" : "Activate"}
                </button>

        </div>
    </div>
)
}

export default function AllHabits() {
    const isUserLoggedIn = useSelector(state => state?.user?.userDetails);
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshData,setRefreshData] = useState(0)

    useEffect(() => {
        api.get(`/habits/`)
            .then(res => setHabits(res.data.results))
            .finally(() => setLoading(false));
    }, [refreshData]);

    const moveHabit = (from, to) => {
        setHabits(prev => {
            const updated = [...prev];
            const [moved] = updated.splice(from, 1);
            updated.splice(to, 0, moved);
            return updated;
        });
    };

    const saveOrder = async () => {
        const order = habits.map(h => h.id);
        await api.post("/habits/reorder/", { order });
    };

    // Auto-save after drag ends  
    useEffect(() => {
        if (!loading) {
            const timer = setTimeout(() => saveOrder(), 500);
            return () => clearTimeout(timer);
        }
    }, [habits]);

    if (!isUserLoggedIn && !loading) {
        return (
            <ProtectedAccessPage 
                message="Your personal habit tracker is waiting. Sign up or log in to continue."
            />
        );
    }

    return (
        <DndProvider backend={MultiBackend} options={HTML5toTouch}>
            <div className="px-6 py-8 max-w-3xl mx-auto page-container">

                {loading ? (
                    <FullScreenLoader />
                ) : habits.length === 0 ? (
                    <p className="text-gray-600 text-center italic">
                        No habits yet. Create your first one!
                    </p>
                ) : (
                    <div className="grid gap-5">
                        {habits.map((habit, index) => (
                            <HabitRow 
                                key={habit.id}
                                habit={habit}
                                index={index}
                                moveHabit={moveHabit}
                                setRefreshData={setRefreshData}
                            />
                        ))}
                    </div>
                )}
            </div>
        </DndProvider>
    );
}
