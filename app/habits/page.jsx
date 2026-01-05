'use client'

import { useEffect, useState, } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { api } from "api";
import { Button } from "@/components/ui/button";
import ProtectedAccessPage from "@/components/common/ProtectedAccessPage";
import AllHabits from "@/components/Habits/AllHabits";
import HabitEntriesPage from "./entries/page";

export default function Page() {
    const isUserLoggedIn = useSelector(state => state?.user?.userDetails);
    const router = useRouter();
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshData,setRefreshData] = useState(0)
    const [openAllHabits,setOpenAllHabits] = useState(false)

    useEffect(() => {
        api.get(`/habits/`)
            .then(res => setHabits(res.data.results))
            .finally(() => setLoading(false));
    }, [refreshData]);

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
        <div className="px-6 py-8 max-w-3xl mx-auto page-container">
            <h1 className="page-title">
                Your Habits
            </h1>

            <div className="flex gap-4 mb-8">
                <Button 
                    className="flex-1 bg-[#FF6B6B] hover:bg-[#ff8282] text-white py-3 rounded-xl text-md font-semibold"
                    onClick={() => router.push("/habits/add")}
                >
                    + Add habit
                </Button>

                <Button 
                    variant="outline"
                    className="flex-1 py-3 rounded-xl text-md font-semibold border-[#FF6B6B] text-[#FF6B6B]"
                    onClick={() => router.push("/habits/entries")}
                >
                    Track progress
                </Button>
            </div>
            <AllHabits />
        </div>
    );
}
