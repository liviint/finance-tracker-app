"use client";

import { useEffect, useState } from "react";
import { api } from "api";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard-stats/")
      .then(res => setStats(res.data))
      .catch(err => console.log(err));
  }, []);

  if (!stats) return <p className="p-8 text-center">Loading dashboard...</p>;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* Top Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card title="Total Users" value={stats.total_users} />
        <Card title="Total Journals" value={stats.total_journals} />
        <Card title="Total Habits" value={stats.total_habits} />
        <Card title="Active Habits" value={stats.active_habits} />
        <Card title="Inactive Habits" value={stats.inactive_habits} />
        <Card title="Total Blogs" value={stats.total_blogs} />
        <Card title="Active Users (7d)" value={stats.active_users_last_7_days} />
      </div>

      {/* Active Users Trend */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold mb-4">Active Users Trend (30 days)</h2>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={stats.active_users_trend}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="active_users" stroke="#2E8B8B" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top 5 Active Users */}
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-semibold mb-4">Top 5 Active Users</h2>
        <table className="w-full table-auto border-collapse border border-gray-200">
          <thead>
            <tr className="bg-gray-100">
              <th className="border px-4 py-2 text-left">Username</th>
              <th className="border px-4 py-2 text-left">Journals</th>
            </tr>
          </thead>
          <tbody>
            {stats.insights.top_5_active_users.map(user => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="border px-4 py-2">{user.username}</td>
                <td className="border px-4 py-2">{user.journal_count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white p-4 rounded-xl shadow border text-center">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-[var(--text)]">{value}</p>
    </div>
  );
}
