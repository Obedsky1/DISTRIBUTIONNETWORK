'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import { queryDocuments } from '@/lib/firebase/firestore';
import { DirectorySubmission } from '@/types/distribution';
import {
    Link as LinkIcon,
    ExternalLink,
    ShieldCheck,
    Search,
    Check,
    X,
    Loader2,
    Globe,
    ArrowUpRight,
    BarChart3,
    AlertCircle,
    Sparkles
} from 'lucide-react';

export default function BacklinkTrackerPage() {
    const { user, openAuthModal } = useAuthStore();
    const [submissions, setSubmissions] = useState<DirectorySubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [checkingId, setCheckingId] = useState<string | null>(null);
    const [results, setResults] = useState<Record<string, { found: boolean; rel?: string; anchor?: string }>>({});

    useEffect(() => {
        if (!user) return;

        const fetchSubmissions = async () => {
            setLoading(true);
            try {
                // Fetch from both collections
                const [dirSubs, commSubs] = await Promise.all([
                    queryDocuments<DirectorySubmission>('directory_submissions', [
                        { field: 'project_id', operator: '==', value: `default_project_${user.id}` }
                    ]),
                    queryDocuments<DirectorySubmission>('community_submissions', [
                        { field: 'project_id', operator: '==', value: `default_project_${user.id}` }
                    ])
                ]);

                // Filter for those with live URLs
                const all = [...(dirSubs || []), ...(commSubs || [])].filter(s => s.live_url);
                setSubmissions(all);
            } catch (err) {
                console.error('Error fetching submissions:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [user]);

    const verifyBacklink = async (sub: DirectorySubmission) => {
        if (!sub.live_url || !user?.startup?.websiteUrl) {
            alert('Missing Live URL or Startup Website URL.');
            return;
        }

        const targetDomain = new URL(user.startup.websiteUrl).hostname.replace('www.', '');
        setCheckingId(sub.id);

        try {
            const res = await fetch('/api/backlinks/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    liveUrl: sub.live_url,
                    targetDomain
                })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                setResults(prev => ({
                    ...prev,
                    [sub.id]: data.result
                }));
            } else {
                alert(data.error || 'Verification failed');
            }
        } catch (err) {
            console.error(err);
            alert('Request failed');
        } finally {
            setCheckingId(null);
        }
    };

    const stats = useMemo(() => {
        const total = submissions.length;
        const verified = Object.values(results).filter(r => r.found).length;
        const doFollow = Object.values(results).filter(r => r.found && (!r.rel || r.rel === 'dofollow' || r.rel === '')).length;
        return { total, verified, doFollow };
    }, [submissions, results]);

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
                <div className="glass-strong p-8 rounded-3xl border border-white/10 text-center max-w-sm">
                    <AlertCircle className="w-12 h-12 text-indigo-400 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Sign in Required</h2>
                    <p className="text-white/40 text-sm mb-6">You need to be logged in to track your backlinks.</p>
                    <button onClick={openAuthModal} className="w-full py-3 bg-indigo-600 rounded-xl font-bold">Sign In</button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                            <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">SEO Monitoring</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black">Backlink Tracker</h1>
                        <p className="text-white/40 mt-2 text-sm max-w-lg">
                            Centralized dashboard to monitor all your published links and verify their SEO value automatically.
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Total Links', value: stats.total, icon: Globe, color: 'text-white' },
                            { label: 'Verified', value: stats.verified, icon: Check, color: 'text-emerald-400' },
                            { label: 'DoFollow', value: stats.doFollow, icon: BarChart3, color: 'text-blue-400' },
                        ].map((s, i) => (
                            <div key={i} className="glass-strong p-4 rounded-2xl border border-white/5 min-w-[120px]">
                                <s.icon className={`w-4 h-4 ${s.color} mb-2`} />
                                <p className="text-xl font-black leading-none">{s.value}</p>
                                <p className="text-[10px] font-medium text-white/30 uppercase tracking-wider mt-1">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4 glass-strong rounded-3xl border border-white/5">
                        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                        <p className="text-white/30 font-medium">Scanning live submissions...</p>
                    </div>
                ) : submissions.length === 0 ? (
                    <div className="glass-strong p-16 rounded-3xl border border-white/5 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <ExternalLink className="w-8 h-8 text-white/20" />
                        </div>
                        <h2 className="text-xl font-bold mb-2 text-white/80">No Live Links Yet</h2>
                        <p className="text-white/40 max-w-md mx-auto mb-8">
                            Submit your startup to directories in the Distribution Workplace and add the Live Published URL to see them here.
                        </p>
                        <a href="/dashboard/directories" className="px-6 py-3 bg-white/10 hover:bg-white/15 rounded-xl font-bold transition-all inline-block">
                            Go to Distribution Workplace
                        </a>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {submissions.map((sub) => {
                            const result = results[sub.id];
                            const isChecking = checkingId === sub.id;

                            return (
                                <div key={sub.id} className="glass-strong group p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-5 flex-1 min-w-0">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <Globe className="w-6 h-6 text-white/40" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold truncate">{sub.directory_name}</h3>
                                                <a href={sub.live_url} target="_blank" rel="noopener noreferrer" className="p-1 hover:bg-white/10 rounded-md transition-colors">
                                                    <ArrowUpRight className="w-3 h-3 text-white/40" />
                                                </a>
                                            </div>
                                            <p className="text-xs text-indigo-400 truncate opacity-60 group-hover:opacity-100 transition-opacity">
                                                {sub.live_url}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Verification Status */}
                                    <div className="flex items-center gap-4">
                                        {result ? (
                                            <div className="flex items-center gap-3">
                                                {result.found ? (
                                                    <>
                                                        <div className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                                            <Check className="w-3 h-3" /> Live & Visible
                                                        </div>
                                                        <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-wider">
                                                            {result.rel || 'DoFollow'}
                                                        </div>
                                                        {result.anchor && (
                                                            <div className="hidden lg:block text-[10px] text-white/40 font-medium">
                                                                Anchor: <span className="text-white/60">"{result.anchor}"</span>
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                                                        <X className="w-3 h-3" /> Link Not Found
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => verifyBacklink(sub)}
                                                    disabled={isChecking}
                                                    className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white/40 hover:text-white transition-all"
                                                >
                                                    <Search className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => verifyBacklink(sub)}
                                                disabled={isChecking}
                                                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-indigo-500/20"
                                            >
                                                {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                                                {isChecking ? 'Verifying...' : 'Verify Link'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Premium Teaser for Free Users */}
            {!user.isPremium && (
                <div className="max-w-7xl mx-auto mt-12">
                    <div className="p-8 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/20 rounded-3xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <Sparkles className="w-32 h-32 text-white" />
                        </div>
                        <div className="relative z-10 max-w-xl">
                            <h3 className="text-xl font-black mb-3 text-white">Advanced SEO Automation</h3>
                            <p className="text-white/50 text-sm mb-6 leading-relaxed">
                                Bulk verify all your backlinks in one click, get alerts when links are removed, and monitor domain authority changes across all placement sites.
                            </p>
                            <a href="/pricing" className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs inline-flex items-center gap-2 transition-all">
                                <ShieldCheck className="w-4 h-4" /> Upgrade to Pro
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
