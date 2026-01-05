"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import { api } from "api";

const COLORS = ["#FF6B6B", "#2E8B8B", "#F4E1D2", "#333333", "#8884d8"];

export default function JournalStats() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = () => {
      api.get(`/journal/stats/`)
      .then(res => {
        setStats(res.data)
        console.log(res.data,"hello res")
      })
      .catch(error => console.log(error))
    };

    fetchStats();
  }, []);

  if (!stats) return <p className="text-center p-10">Loading stats...</p>;

  // Format month labels
  const monthData = stats.entries_per_month.map((item) => ({
    month: new Date(item.month).toLocaleString("default", { month: "short" }),
    count: item.count,
  }));

  // Mood pie chart data
  const moodData = stats.mood_counts.map((item) => ({
    name: item["mood__name"] || "No Mood",
    value: item.count,
  }));

  // Weekdays
  const weekdayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const weekdayData = stats.entries_per_weekday.map((item) => ({
    weekday: weekdayNames[item.weekday - 1],
    count: item.count,
  }));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-10">
      <h2 className="page-title">Jounaling Summary</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-sm text-gray-500">Total Entries</p>
          <p className="text-2xl font-bold">{stats.total_entries}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-sm text-gray-500">Current Streak</p>
          <p className="text-2xl font-bold">{stats.current_streak}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-sm text-gray-500">Best Streak</p>
          <p className="text-2xl font-bold">{stats.best_streak}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow border">
          <p className="text-sm text-gray-500">Moods Used</p>
          <p className="text-2xl font-bold">{moodData.length}</p>
        </div>
      </div>

      {/* ENTRIES PER MONTH */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Entries Per Month</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={monthData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#FF6B6B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* MOOD PIE CHART */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Mood Distribution</h2>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={moodData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={90}
              label
            >
              {moodData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* ENTRIES PER WEEKDAY */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-lg font-semibold mb-4">Entries Per Weekday</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={weekdayData}>
            <XAxis dataKey="weekday" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#2E8B8B" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
