"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { api } from "api";
import { useParams } from "next/navigation";

export default function HabitStatsPage({ habitId }) {
  const router = useRouter()
  const {id} = useParams()
  const [stats, setStats] = useState(null);

  useEffect(() => {
    function load() {
      api.get(`habits/habits/${id}/stats/`)
      .then(res => {
        setStats(res.data)
        console.log(res.data,"hello res data")
      })
      .catch(error => console.log(error))
    }
    load();
  }, [id]);

  if (!stats) return <p className="p-8 text-center">Loading stats...</p>;

  // === FORMATTING HELPERS ===
  const WEEKDAYS = { 1: "Sun", 2: "Mon", 3: "Tue", 4: "Wed", 5: "Thu", 6: "Fri", 7: "Sat" };

  const weekdayData = stats.per_weekday?.map(item => ({
    name: WEEKDAYS[item.weekday],
    count: item.count
  })) || [];


  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthlyData = stats.per_month?.map(item => {
  const monthNumber = parseInt(item.month.slice(5, 7), 10);
  return {
    name: monthNames[monthNumber - 1], 
    count: item.count
  };
}) || [];


  const trendData = stats.trend?.map(entry => ({
    date: entry.day,
    completed: entry.completed ? 1 : 0
  })) || [];

  const completionPieData = [
    { name: "Completed", value: stats.completed_entries },
    { name: "Missed", value: stats.total_entries - stats.completed_entries }
  ];

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6 page-container">
        <h1 className="page-title">
          {stats.habit} — Stats
        </h1>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Progress" value={`${stats.progress_percent}%`} />
        <StatCard title="Completed" value={stats.completed_entries} />
        <StatCard title="Total Logs" value={stats.total_entries} />
        <StatCard title="Longest Streak" value={stats.longest_streak} />
      </div>

      {/* =============== COMPLETION PIE CHART ================= */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Completion Breakdown</h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={completionPieData}
                dataKey="value"
                nameKey="name"
                outerRadius={110}
                label
              >
                {["#2E8B8B", "#F4E1D2"].map((color, index) => (
                  <Cell key={index} fill={color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* =============== WEEKDAY BAR CHART ================= */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Completions Per Weekday</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weekdayData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#FF6B6B" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* =============== MONTHLY BAR CHART ================= */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Activity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#FF6B6B" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* =============== COMPLETION TREND LINE ================= */}
      <Card className="rounded-2xl shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold mb-4">Completion Trend</h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={trendData}>
              <XAxis dataKey="date" />
              <YAxis domain={[0, 1]} />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#FF6B6B" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

    </div>
  );
}

function StatCard({ title, value }) {
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-4 text-center">
        <p className="text-xs uppercase text-gray-500">{title}</p>
        <p className="text-3xl font-bold text-[var(--text)]">{value}</p>
      </CardContent>
    </Card>
  );
}
