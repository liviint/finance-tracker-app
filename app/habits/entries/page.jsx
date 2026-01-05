"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import Loader from "@/components/common/FullScreenLoader";

export default function HabitEntriesPage() {
    const router = useRouter();
    const [entries, setEntries] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get("habits/entries/entries/")
            .then((res) => setEntries(res.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const toggleCompletion = (e,habitId,uuid) => {
        e.stopPropagation()
        api.put("/habits/entries/toggle/", { habit_id: habitId , uuid})
            .then((res) => {
                setEntries((prev) =>
                    prev.map((h) => (h.habit_id === habitId ? res.data : h))
                );
            })
            .catch(console.error);
    };

    if (loading)
        return <Loader />

    const completed = entries.filter((h) => h.completed).length;
    const total = entries.length;
    const percent = total > 0 ? (completed / total) * 100 : 0;

    return (
        <div className="p-4 space-y-4 bg-[#FAF9F7] min-h-screen">
            <h1 className="page-title">
                Today&apos;s Habits
            </h1>

            <Card className="rounded-2xl shadow-sm bg-white">
                <CardContent className="p-4">
                    <h2 className="text-lg font-semibold text-[#333333]">
                        Today&apos;s progress
                    </h2>

                    <div className="w-full h-3 bg-gray-200 rounded-full mt-2">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${percent}%` }}
                            transition={{ duration: 0.5 }}
                            className="h-3 bg-[#FF6B6B] rounded-full"
                        />
                    </div>

                    <p className="text-sm mt-1 text-gray-600">
                        {completed}/{total}
                    </p>
                </CardContent>
            </Card>

            <div className="space-y-3">
                {entries.map((habit) => (
                    <Card
                        key={habit.id}
                        className={`rounded-2xl shadow-sm transition ${
                            habit.completed ? "bg-green-50 opacity-90" : "bg-white"
                        }`}
                    >
                        <CardContent className="flex items-center justify-between p-4">
                            <div>
                                <h3 className="text-lg font-semibold text-[#333333]">
                                    {habit.title}
                                </h3>
                                <p className="text-sm text-gray-500">
                                    Streak: {habit.current_streak}{" "}
                                    {habit.current_streak > 1 ? "days" : "day"}
                                </p>
                            </div>

                            <div className="btn-container">
                                <Link href={`/habits/${habit.habit_id}/stats`}>
                                    <Button
                                    className="btn"
                                    >
                                    Stats
                                    </Button>
                                </Link>
                                <button
                                    onClick={(e) => toggleCompletion(e,habit.habit_id,habit.uuid)}
                                    className={`w-8 h-8 ml-2 rounded-lg flex items-center justify-center border transition ${
                                        habit.completed
                                            ? "bg-[#FF6B6B] border-[#FF6B6B] text-white"
                                            : "bg-white border-gray-300 text-gray-500"
                                    }`}
                                >
                                    {habit.completed ? "✓" : ""}
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

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
                    onClick={() => router.push("/habits")}
                >
                    All Habits
                </Button>
            </div>
        </div>
    );
}
