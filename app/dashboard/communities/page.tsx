'use client';

import { useState, useMemo, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Search, ExternalLink, Plus, CheckCircle, Users, RotateCcw,
    ChevronRight, LayoutGrid, Kanban, TableProperties, Sparkles,
    MessageSquare, Zap, Activity, Filter
} from 'lucide-react';
import { PipelineBoard } from '@/components/directories/PipelineBoard';
import { TableView } from '@/components/directories/TableView';
import { WorkspaceModal } from '@/components/directories/WorkspaceModal';
import { DirectorySubmission } from '@/types/distribution';
import { DropResult } from '@hello-pangea/dnd';
import { useAuthStore } from '@/lib/store/auth-store';
import { queryDocuments, setDocument, updateDocument } from '@/lib/firebase/firestore';
import { PageGuide } from '@/components/PageGuide';
import { authorizedFetch } from '@/lib/api-client';

/* ─── Types ─── */
interface Community {
    id: string;
    name: string;
    platform: string;
    description: string;
    url: string;
    invite_link?: string;
    member_count: number;
    categories: string[];
    use_cases?: string[];
}

type Answers = { niche?: string; platform?: string; size?: string };

/* ─── Onboarding Questions ─── */
const STEPS = [
    {
        id: 'niche',
        question: 'What niche are you targeting?',
        subtitle: "We'll surface the most relevant communities for you",
        options: [
            { value: 'saas-ai', label: 'SaaS / AI Tools', icon: '🤖', desc: 'Software, AI, productivity apps' },
            { value: 'dev', label: 'Developer Tools', icon: '🛠️', desc: 'APIs, SDKs, open source' },
            { value: 'startup', label: 'Startups & Founders', icon: '🚀', desc: 'Indie hackers, entrepreneurs' },
            { value: 'design', label: 'Design & Creative', icon: '🎨', desc: 'UI/UX, branding, creative tools' },
            { value: 'marketing', label: 'Marketing & Growth', icon: '📈', desc: 'SEO, growth hacking, content' },
            { value: 'ecommerce', label: 'E-commerce', icon: '🛒', desc: 'Shopify, DTC, marketplaces' },
            { value: 'health', label: 'Health & Wellness', icon: '💪', desc: 'Fitness, mental health, biotech' },
            { value: 'finance', label: 'Finance & Web3', icon: '💰', desc: 'Fintech, crypto, investing' },
        ],
    },
    {
        id: 'platform',
        question: 'Which platforms do you prefer?',
        subtitle: 'We support Reddit, Discord, Telegram & Facebook groups',
        options: [
            { value: 'Reddit', label: 'Reddit', icon: '🔴', desc: 'Subreddits for your niche' },
            { value: 'Discord', label: 'Discord', icon: '🟣', desc: 'Engaged Discord servers' },
            { value: 'Telegram', label: 'Telegram', icon: '✈️', desc: 'Active Telegram groups' },
            { value: 'Facebook', label: 'Facebook Groups', icon: '🔷', desc: 'Large Facebook audiences' },
            { value: 'all', label: 'All Platforms', icon: '🌐', desc: 'Show me everything' },
        ],
    },
    {
        id: 'size',
        question: 'What community size do you prefer?',
        subtitle: 'Niche communities often outperform large ones for conversions',
        options: [
            { value: 'micro', label: 'Micro (< 5K)', icon: '🎯', desc: 'Highly engaged, easy to stand out' },
            { value: 'mid', label: 'Mid (5K – 50K)', icon: '⚡', desc: 'Good balance of reach & engagement' },
            { value: 'large', label: 'Large (50K+)', icon: '🌊', desc: 'Maximum reach and visibility' },
            { value: 'any', label: 'Any Size', icon: '🔀', desc: "Show me all" },
        ],
    },
];

const PLATFORMS = ['All', 'Reddit', 'Discord', 'Telegram', 'Facebook'];
const PLATFORM_EMOJI: Record<string, string> = { Reddit: '🔴', Discord: '🟣', Telegram: '✈️', Facebook: '🔷' };
const PLATFORM_COLOR: Record<string, string> = {
    Reddit: 'from-orange-500 to-red-600',
    Discord: 'from-indigo-500 to-indigo-700',
    Telegram: 'from-sky-400 to-blue-600',
    Facebook: 'from-blue-600 to-blue-800',
};
const platformColor = (p: string) => PLATFORM_COLOR[p] ?? 'from-gray-600 to-gray-700';
const formatCount = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` :
        n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n || 0);

/* ─── Scoring ─── */
function score(c: Community, a: Answers): number {
    let s = 0;
    const cats = c.categories.map(x => x?.toLowerCase() || '');
    const m = c.member_count || 0;

    const nicheMap: Record<string, string[]> = {
        'saas-ai': ['ai', 'saas', 'software', 'tool', 'product', 'startup'],
        dev: ['dev', 'programming', 'code', 'engineer', 'developer', 'javascript', 'python'],
        startup: ['startup', 'founder', 'entrepreneur', 'indie', 'hacker', 'business'],
        design: ['design', 'ui', 'ux', 'creative', 'figma', 'branding'],
        marketing: ['marketing', 'seo', 'growth', 'content', 'social', 'digital'],
        ecommerce: ['ecommerce', 'shopify', 'commerce', 'store', 'retail'],
        finance: ['finance', 'crypto', 'invest', 'fintech', 'web3', 'blockchain'],
        health: ['health', 'fitness', 'wellness', 'bio', 'medical'],
    };
    const keywords = nicheMap[a.niche || ''] || [];
    if (keywords.some(kw => cats.some(cat => cat.includes(kw)))) s += 3;
    if (keywords.some(kw => c.name.toLowerCase().includes(kw) || (c.description || '').toLowerCase().includes(kw))) s += 1;

    if (a.platform && a.platform !== 'all') {
        if (c.platform === a.platform) s += 2;
        else s -= 5;
    }

    if (a.size === 'micro' && m < 5000) s += 2;
    if (a.size === 'mid' && m >= 5000 && m <= 50000) s += 2;
    if (a.size === 'large' && m > 50000) s += 2;
    if (a.size === 'any') s += 0.5;

    s += Math.log10(Math.max(m, 1)) * 0.3;
    return s;
}

/* ─── Card ─── */
function CommunityCard({ c, isAdded, onAdd }: { c: Community; isAdded: boolean; onAdd: () => void }) {
    return (
        <div className={`rounded-2xl border p-4 flex flex-col gap-2.5 transition-all hover:bg-white/5 group ${isAdded ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/8 bg-white/[0.02]'}`}>
            <div className="flex items-center gap-2.5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platformColor(c.platform)} flex items-center justify-center text-base flex-shrink-0`}>
                    {PLATFORM_EMOJI[c.platform] ?? '💬'}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white truncate group-hover:text-emerald-300 transition-colors">{c.name}</h3>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/35">
                        <span className="capitalize">{c.platform}</span>
                        <span>·</span>
                        <Users className="w-2.5 h-2.5" />
                        <span>{formatCount(c.member_count)}</span>
                    </div>
                </div>
            </div>

            <p className="text-[11px] text-white/40 line-clamp-2 leading-relaxed">{c.description}</p>

            <div className="flex flex-wrap gap-1">
                {c.categories.filter(Boolean).slice(0, 3).map(cat => (
                    <span key={cat} className="px-1.5 py-0.5 rounded-md bg-white/6 text-[9px] text-white/45 border border-white/6">{cat}</span>
                ))}
            </div>

            <div className="flex gap-2 mt-auto pt-1">
                <button
                    onClick={onAdd}
                    disabled={isAdded}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${isAdded
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-300 opacity-60 cursor-not-allowed'
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/22'
                        }`}
                >
                    {isAdded ? <><CheckCircle className="w-3 h-3" />Added</> : <><Plus className="w-3 h-3" />Add to Pipeline</>}
                </button>
                <a
                    href={c.invite_link || c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 hover:bg-white/10 text-white/35 hover:text-white transition-all"
                >
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    );
}

/* ═══════════════════════ PAGE ═══════════════════════ */
export default function CommunitiesPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#080810] flex items-center justify-center text-white/50">Loading workspace...</div>}>
            <CommunitiesContent />
        </Suspense>
    );
}

function CommunitiesContent() {
    const { user, openAuthModal } = useAuthStore();
    const searchParams = useSearchParams();
    const subId = searchParams.get('subId');
    const userId = user?.id || 'anonymous';
    const projectId = `default_project_${userId}`;

    const [allCommunities, setAllCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});
    const [search, setSearch] = useState('');
    const [platformFilter, setPlatformFilter] = useState('All');
    const [showAll, setShowAll] = useState(false);

    const [viewMode, setViewMode] = useState<'grid' | 'pipeline' | 'table'>('grid');
    const [submissions, setSubmissions] = useState<DirectorySubmission[]>([]);
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<DirectorySubmission | null>(null);

    useEffect(() => {
        // Fetch ONLY real communities (Reddit, Discord, Telegram, Facebook) — filter out directories
        fetch('/api/communities?limit=1000&sortBy=member_count&sortOrder=desc')
            .then(r => r.json())
            .then(data => {
                const communities = (data.communities || []).filter(
                    (c: Community) => c.platform !== 'Directory' && !('is_directory' in c && (c as any).is_directory)
                );
                setAllCommunities(communities);
            })
            .catch(console.error)
            .finally(() => setLoading(false));

        if (user) {
            // Check for existing data to skip questionnaire
            queryDocuments<DirectorySubmission>('directory_submissions', [
                { field: 'project_id', operator: '==', value: projectId }
            ]).then(subs => {
                setSubmissions(subs || []);
                if (subs && subs.length > 0) {
                    setStep(3); // Assuming STEPS.length is 3 for CommunitiesPage
                }
            }).catch(err => {
                console.error('Failed to fetch submissions:', err);
            });
        }
    }, [user, projectId]);

    useEffect(() => {
        if (subId && submissions.length > 0) {
            const sub = submissions.find(s => s.id === subId);
            if (sub) {
                setSelectedSubmission(sub);
                setIsWorkspaceOpen(true);
            }
        }
    }, [subId, submissions]);

    const isAdded = (name: string) => submissions.some(s => s.directory_name === name);

    const addToPipeline = async (c: Community) => {
        if (!user) { openAuthModal(); return; }
        if (isAdded(c.name)) return;
        const newSub: DirectorySubmission = {
            id: `csub_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            project_id: projectId,
            directory_id: c.id,
            directory_name: c.name,
            directory_url: c.invite_link || c.url || '',
            status: 'not_started',
            created_at: new Date(),
            updated_at: new Date(),
        };
        try {
            await setDocument('community_submissions', newSub.id, newSub);
            setSubmissions(prev => [newSub, ...prev]);
        } catch (err) { console.error(err); }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;
        if (source.droppableId === destination.droppableId) return;
        const updated = submissions.map(s => s.id === draggableId ? { ...s, status: destination.droppableId as any } : s);
        setSubmissions(updated);
        try { await updateDocument('community_submissions', draggableId, { status: destination.droppableId as any }); }
        catch { setSubmissions(submissions); }
    };

    const openWorkspace = (sub: DirectorySubmission) => { setSelectedSubmission(sub); setIsWorkspaceOpen(true); };
    const closeWorkspace = () => {
        setIsWorkspaceOpen(false); setSelectedSubmission(null);
        if (user) queryDocuments<DirectorySubmission>('community_submissions', [{ field: 'project_id', operator: '==', value: projectId }]).then(s => setSubmissions(s || []));
    };

    const answer = (key: string, value: string) => {
        const next = { ...answers, [key]: value };
        setAnswers(next);
        if (step < STEPS.length - 1) setStep(s => s + 1);
        else setStep(STEPS.length);
    };
    const reset = () => { setAnswers({}); setStep(0); setShowAll(false); setPlatformFilter('All'); };

    /* Scored list */
    const { primary, allSorted } = useMemo(() => {
        if (step < STEPS.length || !allCommunities.length) return { primary: [], allSorted: [] };
        const scored = allCommunities.map(c => ({ c, s: score(c, answers) })).filter(x => x.s > -3).sort((a, b) => b.s - a.s);
        const allSorted = scored.map(x => x.c);
        const threshold = Math.max((scored[0]?.s || 0) * 0.3, 1);
        const primary = scored.filter(x => x.s >= threshold).slice(0, 20).map(x => x.c);
        while (primary.length < 12 && allSorted.length > primary.length) primary.push(allSorted[primary.length]);
        return { primary, allSorted };
    }, [allCommunities, answers, step]);

    /* Filtered display */
    const displayed = useMemo(() => {
        let pool = showAll ? allSorted : primary;
        if (platformFilter !== 'All') pool = pool.filter(c => c.platform === platformFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            pool = pool.filter(c =>
                c.name.toLowerCase().includes(q) ||
                (c.description || '').toLowerCase().includes(q) ||
                c.platform.toLowerCase().includes(q) ||
                c.categories.some(cat => cat?.toLowerCase().includes(q))
            );
        }
        return pool;
    }, [primary, allSorted, showAll, search, platformFilter]);

    /* Platform counts for tabs */
    const platformCounts = useMemo(() => {
        const pool = showAll ? allSorted : primary;
        const counts: Record<string, number> = { All: pool.length };
        PLATFORMS.slice(1).forEach(p => { counts[p] = pool.filter(c => c.platform === p).length; });
        return counts;
    }, [primary, allSorted, showAll]);

    /* ─── ONBOARDING ─── */
    if (step < STEPS.length) {
        const cur = STEPS[step];
        const progress = (step / STEPS.length) * 100;
        return (
            <div className="min-h-screen bg-[#080810] text-white flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="h-0.5 bg-white/8">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">📡</div>
                        <span className="font-black tracking-tight">Community Finder</span>
                    </div>
                    <div className="flex gap-3 text-xs text-white/30">
                        <a href="/discover" className="hover:text-white transition-colors">All Channels</a>
                        <a href="/dashboard/directories" className="hover:text-white transition-colors">Directories</a>
                        <a href="/" className="hover:text-white transition-colors">← Home</a>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-2xl">
                        <div className="flex items-center gap-2 mb-10">
                            {STEPS.map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all
                                        ${i < step ? 'bg-emerald-600 border-emerald-600 text-white' : i === step ? 'border-emerald-500 text-emerald-400' : 'border-white/15 text-white/25'}`}>
                                        {i < step ? '✓' : i + 1}
                                    </div>
                                    {i < STEPS.length - 1 && <div className={`h-px w-12 ${i < step ? 'bg-emerald-500' : 'bg-white/10'}`} />}
                                </div>
                            ))}
                        </div>
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">{cur.question}</h1>
                            <p className="text-white/40 text-sm">{cur.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {cur.options.map(opt => (
                                <button key={opt.value} onClick={() => answer(cur.id, opt.value)}
                                    className="flex flex-col items-start gap-2 p-4 rounded-2xl border border-white/8 bg-white/3 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-left transition-all group">
                                    <span className="text-2xl">{opt.icon}</span>
                                    <div>
                                        <p className="text-sm font-bold group-hover:text-emerald-300 transition-colors">{opt.label}</p>
                                        <p className="text-[11px] text-white/35 mt-0.5">{opt.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                        {step > 0 && (
                            <button onClick={() => setStep(s => s - 1)} className="mt-6 text-xs text-white/30 hover:text-white transition-colors">← Back</button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* ─── MAIN WORKSPACE ─── */
    return (
        <div className="min-h-screen bg-[#080810] text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-5">
                    <div>
                        <div className="flex items-center gap-2.5 mb-1">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-lg">📡</div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Community Workspace</h1>
                        </div>
                        <p className="text-white/35 text-xs sm:text-sm ml-11">
                            {allSorted.length} social communities matched · Reddit, Discord, Telegram & Facebook
                        </p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#1a1a24] p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
                        {[
                            { id: 'grid', icon: <LayoutGrid className="w-4 h-4" />, label: 'Discover' },
                            { id: 'pipeline', icon: <Kanban className="w-4 h-4" />, label: 'Pipeline' },
                            { id: 'table', icon: <TableProperties className="w-4 h-4" />, label: 'List' },
                        ].map(v => (
                            <button key={v.id} onClick={() => setViewMode(v.id as any)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === v.id ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white/80'}`}>
                                {v.icon} {v.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { icon: '🔴', label: 'Reddit', val: allSorted.filter(c => c.platform === 'Reddit').length, color: 'text-orange-400' },
                        { icon: '🟣', label: 'Discord', val: allSorted.filter(c => c.platform === 'Discord').length, color: 'text-indigo-400' },
                        { icon: '✈️', label: 'Telegram', val: allSorted.filter(c => c.platform === 'Telegram').length, color: 'text-sky-400' },
                        { icon: '🔷', label: 'Facebook', val: allSorted.filter(c => c.platform === 'Facebook').length, color: 'text-blue-400' },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-3 flex items-center gap-3">
                            <span className="text-xl">{s.icon}</span>
                            <div>
                                <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                                <p className="text-[10px] text-white/35">{s.label} Communities</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Grid View */}
                {viewMode === 'grid' && (
                    <div className="space-y-4">
                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                                <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                                    placeholder="Search communities, platforms, categories…"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-emerald-500/50" />
                            </div>
                            <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white text-sm transition-colors whitespace-nowrap">
                                <RotateCcw className="w-3.5 h-3.5" /> Re-match
                            </button>
                        </div>

                        {/* Platform tabs */}
                        <div className="flex gap-2 flex-wrap">
                            {PLATFORMS.map(p => (
                                <button key={p} onClick={() => setPlatformFilter(p)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${platformFilter === p
                                        ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                                        : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'
                                        }`}>
                                    {p !== 'All' && PLATFORM_EMOJI[p]}
                                    {p}
                                    <span className="text-[10px] opacity-60">({platformCounts[p] || 0})</span>
                                </button>
                            ))}
                        </div>

                        {/* Section label */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-emerald-400" />
                                <h2 className="text-sm font-bold text-white/80">
                                    {showAll ? 'All Communities' : 'Best Matches'} — {displayed.length} shown
                                </h2>
                            </div>
                            <div className="flex items-center gap-1 text-white/25 text-[10px]">
                                <Filter className="w-3 h-3" />{platformFilter !== 'All' ? `${platformFilter} only` : 'All platforms'}
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-white/30 text-sm animate-pulse">Loading communities…</div>
                        ) : displayed.length === 0 ? (
                            <div className="text-center py-16 text-white/30 text-sm">
                                No communities found.{' '}
                                <button onClick={reset} className="text-emerald-400 underline">Re-run the matcher</button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {displayed.map((c, i) => (
                                    <CommunityCard key={c.id + i} c={c} isAdded={isAdded(c.name)} onAdd={() => addToPipeline(c)} />
                                ))}
                            </div>
                        )}

                        {!showAll && allSorted.length > primary.length && !search && (
                            <button onClick={() => setShowAll(true)}
                                className="w-full py-3 rounded-xl border border-white/10 text-white/40 text-sm font-medium hover:bg-white/5 hover:text-white transition-all flex justify-center items-center gap-2">
                                View All {allSorted.length} Communities <ChevronRight className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

                {viewMode === 'pipeline' && (
                    <PipelineBoard submissions={submissions} onDragEnd={handleDragEnd} onOpenWorkspace={openWorkspace} />
                )}

                {viewMode === 'table' && (
                    <TableView submissions={submissions} onOpenWorkspace={openWorkspace} />
                )}
            </main>

            <WorkspaceModal isOpen={isWorkspaceOpen} onClose={closeWorkspace} submission={selectedSubmission} userId={userId} />

            <PageGuide
                title="Communities Workspace"
                steps={[
                    { title: 'Community Finder', description: 'Answer exactly what you are building to get a curated list of high-converting communities on Reddit, Discord, Telegram, and Facebook.' },
                    { title: 'Filter & Search', description: 'Interact with the filters and search to find exactly what you need. Click Add to Pipeline to save your targets.' },
                    { title: 'Pipeline View', description: 'Switch to Pipeline to see your kanban board. Drag and drop targets to organize your distribution efforts.' },
                    { title: 'Workspace Generator', description: 'Click any target in your Pipeline to open a specialized popup that auto-generates platform-native copy for that community.' },
                ]}
            />
        </div>
    );
}
