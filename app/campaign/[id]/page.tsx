'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { motion } from 'framer-motion';
import {
    ArrowLeft, Rocket, Loader2, Search, Sparkles, Copy,
    CheckCircle2, BarChart2, MessageSquare, Target, ExternalLink,
    TrendingUp, Clock, Zap, ChevronRight, Twitter
} from 'lucide-react';
import { Campaign } from '@/types';
import { PageGuide } from '@/components/PageGuide';

type Tab = 'targets' | 'analytics' | 'listening';

// ── Analytics helpers ──────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 80, stroke = 7, color = '#6366f1' }: { pct: number; size?: number; stroke?: number; color?: string }) {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
        <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
                strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 0.6s ease' }} />
        </svg>
    );
}

export default function CampaignWorkspace() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const id = params.id as string;

    const [tab, setTab] = useState<Tab>('targets');
    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);

    // URL gate: targetId -> url the user is typing
    const [pendingUrls, setPendingUrls] = useState<Record<string, string>>({});
    const [awaitingUrl, setAwaitingUrl] = useState<string | null>(null); // which target is showing the url input

    // Social Listening
    const [listenKeyword, setListenKeyword] = useState('');
    const [listenResults, setListenResults] = useState<any[]>([]);
    const [isListening, setIsListening] = useState(false);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [generatingReplyFor, setGeneratingReplyFor] = useState<string | null>(null);

    useEffect(() => {
        if (!user) { setLoading(false); return; }
        fetch(`/api/campaigns/${id}`)
            .then(r => r.json())
            .then(d => { if (d.success) setCampaign(d.data); else setError(d.error || 'Not found'); })
            .catch(e => setError(e.message))
            .finally(() => setLoading(false));
    }, [id, user]);

    const handleMarkTarget = async (targetId: string, currentStatus: string) => {
        if (!campaign || updating) return;

        // If undoing a completion, no URL needed
        if (currentStatus === 'completed') {
            setUpdating(true);
            const newTargets = campaign.targets.map(t =>
                t.id === targetId ? { ...t, status: 'pending' as const, completedAt: null, submissionUrl: null } : t
            );
            try {
                const res = await fetch(`/api/campaigns/${campaign.id}`, {
                    method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ targets: newTargets }),
                });
                if (res.ok) setCampaign({ ...campaign, targets: newTargets });
            } finally { setUpdating(false); }
            return;
        }

        // Require URL before marking done
        if (awaitingUrl !== targetId) {
            setAwaitingUrl(targetId);
            return;
        }

        const submissionUrl = pendingUrls[targetId]?.trim();
        if (!submissionUrl) { alert('Please enter your post or submission URL first.'); return; }

        setUpdating(true);
        const newTargets = campaign.targets.map(t =>
            t.id === targetId ? { ...t, status: 'completed' as const, completedAt: new Date(), submissionUrl } : t
        );
        try {
            const res = await fetch(`/api/campaigns/${campaign.id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ targets: newTargets }),
            });
            if (res.ok) {
                setCampaign({ ...campaign, targets: newTargets });
                setAwaitingUrl(null);
                setPendingUrls(prev => { const p = { ...prev }; delete p[targetId]; return p; });
            }
        } finally { setUpdating(false); }
    };

    const handleUnlockNextPhase = async () => {
        if (!campaign || updating || !canUnlockNext || isLastBatch) return;
        setUpdating(true);
        const newIndex = campaign.currentBatchIndex + 1;
        try {
            const res = await fetch(`/api/campaigns/${campaign.id}`, {
                method: 'PATCH', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentBatchIndex: newIndex }),
            });
            if (res.ok) setCampaign({ ...campaign, currentBatchIndex: newIndex });
        } finally { setUpdating(false); }
    };

    const handleListen = async () => {
        if (!listenKeyword || isListening) return;
        setIsListening(true);
        setListenResults([]);
        try {
            const res = await fetch('/api/social-listening', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ keyword: listenKeyword }),
            });
            const data = await res.json();
            if (data.success) setListenResults(data.data);
            else alert(data.error);
        } catch (e) { console.error(e); }
        finally { setIsListening(false); }
    };

    // On-demand AI reply for a single post
    const handleGenerateReply = async (postId: string, postContent: string) => {
        if (generatingReplyFor) return;
        setGeneratingReplyFor(postId);
        try {
            const res = await fetch('/api/social-listening', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    generateReplyForId: postId,
                    postContent,
                    keyword: listenKeyword,
                    campaignContext: `We are distributing ${campaign?.name || 'our startup'} and helping users who need ${listenKeyword}.`,
                }),
            });
            const data = await res.json();
            if (data.success && data.reply) {
                setListenResults(prev => prev.map(p =>
                    p.id === postId ? { ...p, suggestedReply: data.reply } : p
                ));
            } else {
                alert(data.error || 'Failed to generate reply');
            }
        } catch (e) { console.error(e); }
        finally { setGeneratingReplyFor(null); }
    };

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
    );

    if (!user) return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white gap-4">
            <p className="text-white/60">Sign in to view your campaign workspace.</p>
            <button onClick={() => router.push('/')} className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 rounded-xl text-sm font-bold transition-colors">Go to Home</button>
        </div>
    );

    if (error || !campaign) return (
        <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center text-white">
            <p className="text-red-400 mb-4">{error || 'Campaign not found'}</p>
            <button onClick={() => router.push('/campaign')} className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300">
                <ArrowLeft className="w-4 h-4" /> Back to campaigns
            </button>
        </div>
    );

    // ── Derived data ──────────────────────────────────────────────────────────
    const BATCH_SIZE = 3;
    const allTargets = campaign.targets || [];
    const currentIndex = campaign.currentBatchIndex || 0;
    const currentBatch = allTargets.slice(currentIndex * BATCH_SIZE, (currentIndex + 1) * BATCH_SIZE);
    const completedInBatch = currentBatch.filter(t => t.status === 'completed').length;
    const canUnlockNext = completedInBatch >= 2;
    const isLastBatch = (currentIndex + 1) * BATCH_SIZE >= allTargets.length;
    const totalCompleted = allTargets.filter(t => t.status === 'completed').length;
    const totalTargets = allTargets.length;
    const overallPct = totalTargets > 0 ? Math.round((totalCompleted / totalTargets) * 100) : 0;
    const totalPhases = Math.ceil(totalTargets / BATCH_SIZE);

    // Phase breakdown for analytics
    const phases = Array.from({ length: totalPhases }, (_, i) => {
        const batch = allTargets.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE);
        const done = batch.filter(t => t.status === 'completed').length;
        return { phase: i + 1, total: batch.length, done, pct: Math.round((done / batch.length) * 100) };
    });

    const tabs: { id: Tab; label: string; icon: any }[] = [
        { id: 'targets', label: 'Targets', icon: Target },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'listening', label: 'Social Listening', icon: MessageSquare },
    ];

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">
            {/* ── Top bar ── */}
            <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4 min-w-0">
                        <button onClick={() => router.push('/campaign')} className="text-white/40 hover:text-white transition-colors flex-shrink-0">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-white font-bold text-base truncate">{campaign.name}</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${campaign.status === 'active' ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                                <span className="text-white/40 text-xs capitalize">{campaign.status}</span>
                                <span className="text-white/20 text-xs">•</span>
                                <span className="text-white/40 text-xs">{totalCompleted}/{totalTargets} done</span>
                            </div>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="hidden sm:flex items-center gap-3 flex-shrink-0">
                        <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-400 rounded-full transition-all duration-500"
                                style={{ width: `${overallPct}%` }} />
                        </div>
                        <span className="text-white/50 text-xs font-bold">{overallPct}%</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="max-w-6xl mx-auto px-4 sm:px-6 flex gap-0">
                    {tabs.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all ${tab === t.id
                                ? 'border-indigo-500 text-indigo-300'
                                : 'border-transparent text-white/40 hover:text-white/70'
                                }`}
                        >
                            <t.icon className="w-4 h-4" /> {t.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

                {/* ══ TARGETS TAB ═══════════════════════════════════════════════════════ */}
                {tab === 'targets' && (
                    <div className="space-y-6">
                        {/* Current batch header */}
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-white">Current Batch</h2>
                                <p className="text-white/40 text-sm mt-0.5">
                                    Phase {currentIndex + 1} of {totalPhases} — complete 2 to unlock the next
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${completedInBatch >= 2 ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' : 'bg-white/5 text-white/50 border border-white/10'}`}>
                                {completedInBatch}/{currentBatch.length} done
                            </span>
                        </div>

                        {currentBatch.length === 0 ? (
                            <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl">
                                <p className="text-white/40">No targets in this campaign yet.</p>
                            </div>
                        ) : (
                            <div className="grid gap-3">
                                {currentBatch.map((target, i) => (
                                    <motion.div
                                        key={target.id}
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.06 }}
                                        className={`flex items-center justify-between p-5 rounded-2xl border transition-all
                                            ${target.status === 'completed'
                                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                                : 'bg-white/5 border-white/10 hover:border-white/20'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${target.status === 'completed' ? 'bg-emerald-500/20' : 'bg-white/5'}`}>
                                                {target.status === 'completed'
                                                    ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                                    : <Zap className="w-5 h-5 text-white/30" />
                                                }
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h3 className={`font-bold text-base truncate ${target.status === 'completed' ? 'text-emerald-300' : 'text-white'}`}>
                                                    {target.name}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-white/30 text-xs capitalize">{target.kind}</span>
                                                    {target.url && (
                                                        <a href={target.url} target="_blank" rel="noopener noreferrer"
                                                            className="text-indigo-400/70 hover:text-indigo-300 text-xs flex items-center gap-1 transition-colors"
                                                            onClick={e => e.stopPropagation()}>
                                                            Visit <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                    {target.submissionUrl && target.status === 'completed' && (
                                                        <a href={target.submissionUrl} target="_blank" rel="noopener noreferrer"
                                                            className="text-emerald-400/70 hover:text-emerald-300 text-xs flex items-center gap-1 transition-colors"
                                                            onClick={e => e.stopPropagation()}>
                                                            Post URL <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                {/* URL input gate */}
                                                {awaitingUrl === target.id && target.status !== 'completed' && (
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <input
                                                            autoFocus
                                                            type="url"
                                                            placeholder="Paste your post/submission URL…"
                                                            value={pendingUrls[target.id] || ''}
                                                            onChange={e => setPendingUrls(prev => ({ ...prev, [target.id]: e.target.value }))}
                                                            onKeyDown={e => e.key === 'Enter' && handleMarkTarget(target.id, target.status)}
                                                            className="flex-1 bg-black/30 border border-white/20 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500/60 placeholder-white/20"
                                                        />
                                                        <button onClick={() => setAwaitingUrl(null)} className="text-white/30 hover:text-white text-xs px-2">Cancel</button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleMarkTarget(target.id, target.status)}
                                            disabled={updating}
                                            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 flex-shrink-0
                                                ${target.status === 'completed'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                                                    : awaitingUrl === target.id
                                                        ? 'bg-indigo-500 text-white border border-indigo-500'
                                                        : 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20'
                                                }`}
                                        >
                                            {updating && awaitingUrl === target.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> :
                                                target.status === 'completed' ? 'Undo' :
                                                    awaitingUrl === target.id ? 'Confirm Done' : 'Mark Done'}
                                        </button>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {/* Unlock next */}
                        {!isLastBatch ? (
                            <div className="mt-6 flex flex-col items-center p-8 bg-indigo-900/10 rounded-3xl border border-dashed border-indigo-500/20">
                                <p className="text-indigo-300/70 text-sm mb-4 text-center">
                                    {canUnlockNext ? '🎉 Ready! Unlock the next batch to keep distributing.' : `Complete at least 2 targets to unlock the next ${Math.min(BATCH_SIZE, totalTargets - (currentIndex + 1) * BATCH_SIZE)} channels.`}
                                </p>
                                <button
                                    onClick={handleUnlockNextPhase}
                                    disabled={!canUnlockNext || updating}
                                    className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2
                                        ${canUnlockNext ? 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'bg-gray-800 text-gray-600 cursor-not-allowed border border-white/5'}`}
                                >
                                    {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Unlock Next Phase <ChevronRight className="w-4 h-4" /></>}
                                </button>
                            </div>
                        ) : (
                            <div className="mt-6 p-8 bg-emerald-900/10 rounded-3xl border border-emerald-500/20 text-center">
                                <p className="text-emerald-400 font-bold mb-1">🏁 Final Phase</p>
                                {totalCompleted === totalTargets && <p className="text-emerald-500/60 text-sm">All targets completed — outstanding work!</p>}
                            </div>
                        )}
                    </div>
                )}

                {/* ══ ANALYTICS TAB ════════════════════════════════════════════════════ */}
                {tab === 'analytics' && (
                    <div className="space-y-6">
                        {/* KPI row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { label: 'Overall Progress', value: `${overallPct}%`, sub: `${totalCompleted} of ${totalTargets} done`, color: '#6366f1' },
                                { label: 'Current Phase', value: `${currentIndex + 1} / ${totalPhases}`, sub: 'phases completed', color: '#10b981' },
                                { label: 'Completed Targets', value: totalCompleted, sub: 'channels reached', color: '#f59e0b' },
                                { label: 'Remaining', value: totalTargets - totalCompleted, sub: 'targets left', color: '#8b5cf6' },
                            ].map((kpi, i) => (
                                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-1">
                                    <p className="text-white/40 text-xs font-semibold uppercase tracking-widest">{kpi.label}</p>
                                    <p className="text-3xl font-black text-white">{kpi.value}</p>
                                    <p className="text-white/30 text-xs">{kpi.sub}</p>
                                </div>
                            ))}
                        </div>

                        {/* Overall ring + phase bar */}
                        <div className="grid md:grid-cols-2 gap-4">
                            {/* Ring */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 flex items-center gap-6">
                                <div className="relative flex-shrink-0">
                                    <ProgressRing pct={overallPct} size={100} stroke={9} color="#6366f1" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-white font-black text-xl">{overallPct}%</span>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-white font-bold text-lg">Campaign Progress</p>
                                    <p className="text-white/40 text-sm mt-1">{totalCompleted} channels reached out of {totalTargets}</p>
                                    <div className="mt-3 flex items-center gap-3 text-xs">
                                        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-indigo-500" /> Completed</span>
                                        <span className="flex items-center gap-1.5 text-white/30"><span className="w-2 h-2 rounded-full bg-white/10" /> Remaining</span>
                                    </div>
                                </div>
                            </div>

                            {/* Phase breakdown */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                                <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-4">Phase Breakdown</p>
                                <div className="space-y-3">
                                    {phases.map(p => (
                                        <div key={p.phase}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-white/70 text-xs font-medium">
                                                    Phase {p.phase}
                                                    {p.phase === currentIndex + 1 && <span className="ml-2 text-indigo-400 font-bold">← current</span>}
                                                </span>
                                                <span className="text-white/40 text-xs">{p.done}/{p.total}</span>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-500 ${p.pct === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                    style={{ width: `${p.pct}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* All targets table */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                            <div className="px-5 py-4 border-b border-white/10">
                                <p className="text-white font-bold text-sm">All Targets</p>
                            </div>
                            <div className="divide-y divide-white/5">
                                {allTargets.map((t, i) => {
                                    const phase = Math.floor(i / BATCH_SIZE) + 1;
                                    return (
                                        <div key={t.id} className="flex items-center justify-between px-5 py-3">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <span className="text-white/20 text-xs w-5 text-right flex-shrink-0">{i + 1}</span>
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'completed' ? 'bg-emerald-400' : 'bg-white/20'}`} />
                                                <span className="text-white/80 text-sm font-medium truncate">{t.name}</span>
                                            </div>
                                            <div className="flex items-center gap-3 flex-shrink-0">
                                                <span className="text-white/20 text-xs hidden sm:block">Phase {phase}</span>
                                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${t.status === 'completed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-white/30 bg-white/5'}`}>
                                                    {t.status}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* ══ SOCIAL LISTENING TAB ════════════════════════════════════════════ */}
                {tab === 'listening' && (
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-indigo-400" /> Social Listening
                            </h2>
                            <p className="text-white/40 text-sm mt-1">
                                Find active conversations across Reddit, Twitter/X, and more. Powered by Xpoz & Groq AI.
                            </p>
                        </div>

                        {/* Search input */}
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input
                                    type="text"
                                    placeholder="e.g. startup, founders, marketing, seo"
                                    value={listenKeyword}
                                    onChange={e => setListenKeyword(e.target.value.replace(/\s+/g, ''))} // Enforce single word
                                    onKeyDown={e => e.key === 'Enter' && handleListen()}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-11 pr-4 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                                />
                            </div>
                            <button
                                onClick={handleListen}
                                disabled={!listenKeyword || isListening}
                                className="px-6 py-3.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 rounded-2xl text-white font-bold text-sm flex items-center gap-2 transition-all whitespace-nowrap"
                            >
                                {isListening ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                                {isListening ? 'Scanning...' : 'Scan'}
                            </button>
                        </div>

                        {/* Suggested keywords */}
                        <div className="flex flex-wrap gap-2">
                            {[
                                'startup',
                                'marketing',
                                'founders',
                                'saas',
                                'seo'
                            ].map(k => (
                                <button key={k} onClick={() => { setListenKeyword(k); }}
                                    className="text-xs px-3 py-1.5 bg-white/5 border border-white/10 hover:border-white/20 text-white/50 hover:text-white rounded-full transition-all">
                                    {k}
                                </button>
                            ))}
                        </div>

                        {/* Results */}
                        {listenResults.length > 0 ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <p className="text-white/40 text-sm">
                                        Found <span className="text-white font-bold">{listenResults.length}</span> relevant conversations
                                    </p>
                                    <p className="text-white/20 text-xs">Tap "Generate Reply" to create an AI response for any post</p>
                                </div>
                                {listenResults.map((post) => (
                                    <div key={post.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2 text-white/40 text-xs font-semibold uppercase tracking-wider">
                                                {post.platform === 'twitter' && <Twitter className="w-3.5 h-3.5 text-blue-400" />}
                                                {post.platform === 'reddit' && <span className="text-orange-400">🔴</span>}
                                                {post.platform} · {post.author}
                                                {post.subreddit && <span className="text-orange-400/70 normal-case">r/{post.subreddit}</span>}
                                                {post.relevanceScore != null && (
                                                    <span className={`ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold normal-case ${post.relevanceScore >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                                                        post.relevanceScore >= 50 ? 'bg-amber-500/20 text-amber-400' :
                                                            'bg-white/10 text-white/40'
                                                        }`}>{post.relevanceScore}% match</span>
                                                )}
                                            </div>
                                            <a href={post.url} target="_blank" rel="noopener noreferrer"
                                                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold px-3 py-1 bg-indigo-500/10 rounded-full flex items-center gap-1 transition-colors">
                                                View <ExternalLink className="w-3 h-3" />
                                            </a>
                                        </div>
                                        <p className="text-white/80 text-sm leading-relaxed mb-3">{post.content}</p>

                                        {/* Engagement stats */}
                                        {post.engagement && (
                                            <div className="flex items-center gap-3 mb-4 text-[11px] text-white/30">
                                                {post.engagement.likes != null && <span>❤️ {post.engagement.likes}</span>}
                                                {post.engagement.retweets != null && <span>🔁 {post.engagement.retweets}</span>}
                                                {post.engagement.replies != null && <span>💬 {post.engagement.replies}</span>}
                                                {post.engagement.score != null && <span>⬆️ {post.engagement.score}</span>}
                                                {post.engagement.comments != null && <span>💬 {post.engagement.comments}</span>}
                                            </div>
                                        )}

                                        {/* AI Reply section */}
                                        {post.suggestedReply ? (
                                            <div className="border-t border-white/10 pt-4">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                                                        <Sparkles className="w-3.5 h-3.5" /> AI Suggested Reply
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(post.suggestedReply, post.id)}
                                                        className="text-xs text-white/40 hover:text-white flex items-center gap-1 transition-colors"
                                                    >
                                                        {copiedId === post.id ? <><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                                                    </button>
                                                </div>
                                                <div className="bg-black/30 rounded-xl p-4 text-sm text-white/70 leading-relaxed">
                                                    {post.suggestedReply}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                                                <span className="text-white/20 text-xs">No reply generated yet</span>
                                                <button
                                                    onClick={() => handleGenerateReply(post.id, post.content)}
                                                    disabled={generatingReplyFor !== null}
                                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all
                                                        ${generatingReplyFor === post.id
                                                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                                                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 hover:text-indigo-300'
                                                        } disabled:opacity-40`}
                                                >
                                                    {generatingReplyFor === post.id
                                                        ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Generating...</>
                                                        : <><Sparkles className="w-3.5 h-3.5" /> Generate Reply</>}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 border border-dashed border-white/10 rounded-3xl">
                                <MessageSquare className="w-10 h-10 text-white/10 mx-auto mb-3" />
                                <p className="text-white/30 text-sm">Enter a keyword to scan for conversations you can engage with</p>
                                <p className="text-white/15 text-xs mt-1">AI replies are generated on-demand to save costs</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <PageGuide
                title="Campaign Workspace"
                steps={[
                    { title: 'Targets Tab', description: 'Run your drip campaign here. Open the channel, submit your distribution link, and come back here and mark it as done! Keep going to unlock the next batch.' },
                    { title: 'Analytics Tab', description: 'Track your overall progress and see exactly how far along you are in achieving your distribution goals.' },
                    { title: 'Social Listening Tab', description: 'Enter keywords related to your startup, and our AI agent will find relevant conversations across Reddit, X, etc. and give you a generated reply to quickly drive traffic to your startup.' },
                ]}
            />
        </main>
    );
}
