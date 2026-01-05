"use client"
import FullScreenLoader from "@/components/common/FullScreenLoader";
import { useState } from "react";

export function HabitStatsScreen({ habitId }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        fetch(`${API}/habits/${habitId}/stats/`, { credentials: "include" })
        .then((res) => res.json())
        .then((data) => setStats(data))
        .finally(() => setLoading(false));
    }, [habitId]);


if (loading) return <FullScreenLoader />


    return (
    <div className="p-6 max-w-2xl mx-auto">
        <Link href={`/habits/${habitId}`} className="text-[#2E8B8B] underline mb-4 block">← Back</Link>
        <h1 className="text-3xl font-bold text-[#FF6B6B] mb-4">{stats.habit} Stats</h1>


        <div className="p-6 bg-white rounded-2xl shadow border border-[#F4E1D2] grid gap-4">
            <p><strong>Progress:</strong> {stats.progress_percent}%</p>
            <p><strong>Total Entries:</strong> {stats.total_entries}</p>
            <p><strong>Completed:</strong> {stats.completed_entries}</p>
            <p><strong>Latest Entry:</strong> {stats.latest_entry?.date || "None"}</p>
            <p><strong>Streak:</strong> {stats.longest_streak} days</p>
        </div>
    </div>
    );
}