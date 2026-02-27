'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Target, TrendingUp, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import { DirectorySubmission } from '@/types/distribution';

// Static USER ID for current impl
const USER_ID = 'test_user_id';
const PROJECT_ID = 'default_project_id';

export default function AnalyticsDashboard() {
    const [submissions, setSubmissions] = useState<DirectorySubmission[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`/api/submissions?projectId=${PROJECT_ID}`)
            .then(res => res.json())
            .then(data => {
                setSubmissions(data.submissions || []);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return <div className="min-h-screen bg-[#080810] flex items-center justify-center text-white/50">Loading analytics...</div>;
    }

    const total = submissions.length;
    const approved = submissions.filter(s => s.status === 'approved' || s.status === 'live').length;
    const live = submissions.filter(s => s.status === 'live').length;
    const rejected = submissions.filter(s => s.status === 'rejected').length;

    const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0;
    const rejectionRate = total > 0 ? Math.round((rejected / total) * 100) : 0;

    const chartData = [
        { name: 'Not Started', value: submissions.filter(s => s.status === 'not_started').length, color: '#6b7280' },
        { name: 'Submitted', value: submissions.filter(s => s.status === 'submitted').length, color: '#3b82f6' },
        { name: 'Approved', value: submissions.filter(s => s.status === 'approved').length, color: '#10b981' },
        { name: 'Live', value: submissions.filter(s => s.status === 'live').length, color: '#8b5cf6' },
        { name: 'Follow Up', value: submissions.filter(s => s.status === 'follow_up').length, color: '#f59e0b' },
        { name: 'Rejected', value: submissions.filter(s => s.status === 'rejected').length, color: '#ef4444' },
    ];

    return (
        <div className="min-h-screen bg-[#080810] text-white pt-24" style={{ fontFamily: 'Inter, sans-serif' }}>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

                {/* Header */}
                <div className="border-b border-white/10 pb-6">
                    <h1 className="text-3xl font-black tracking-tight mb-2">Performance Analytics</h1>
                    <p className="text-white/40 text-sm">Track your submission conversions and pipeline effectively.</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Total Submissions"
                        value={total.toString()}
                        icon={<Target className="w-5 h-5 text-blue-400" />}
                    />
                    <MetricCard
                        title="Approval Rate"
                        value={`${approvalRate}%`}
                        icon={<TrendingUp className="w-5 h-5 text-green-400" />}
                    />
                    <MetricCard
                        title="Live Directories"
                        value={live.toString()}
                        icon={<CheckCircle className="w-5 h-5 text-violet-400" />}
                    />
                    <MetricCard
                        title="Rejection Rate"
                        value={`${rejectionRate}%`}
                        icon={<XCircle className="w-5 h-5 text-red-400" />}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Chart */}
                    <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                        <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-violet-400" /> Pipeline Breakdown
                        </h2>
                        <div className="h-72 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <XAxis dataKey="name" stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis stroke="#ffffff40" fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip
                                        cursor={{ fill: '#ffffff10' }}
                                        contentStyle={{ backgroundColor: '#1a1a24', border: '1px solid #ffffff20', borderRadius: '12px' }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Needs Attention */}
                    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex flex-col">
                        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-yellow-400" /> Follow Ups Needed
                        </h2>
                        <div className="flex-1 overflow-y-auto space-y-3">
                            {submissions.filter(s => s.status === 'follow_up').map(sub => (
                                <div key={sub.id} className="bg-[#1a1a24] border border-white/10 rounded-xl p-3">
                                    <h3 className="font-bold text-sm text-white mb-1">{sub.directory_name}</h3>
                                    <p className="text-xs text-white/50">{new Date(sub.updated_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                            {submissions.filter(s => s.status === 'follow_up').length === 0 && (
                                <p className="text-sm text-white/40text-center py-10">No follow ups currently required.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function MetricCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-start justify-between">
            <div>
                <p className="text-sm font-semibold text-white/50 mb-1">{title}</p>
                <p className="text-3xl font-black">{value}</p>
            </div>
            <div className="p-2.5 bg-[#1a1a24] rounded-xl border border-white/10">
                {icon}
            </div>
        </div>
    );
}
