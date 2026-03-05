'use client';

import { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    Search, Filter, Globe, BarChart2, CheckCircle, Plus,
    ArrowRight, Loader2, MessageSquare, ExternalLink, RefreshCw, X, Sparkles,
    RotateCcw, ChevronRight, LayoutGrid, Kanban, TableProperties
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/store/auth-store';
import { queryDocuments, setDocument, updateDocument } from '@/lib/firebase/firestore';
import { PageGuide } from '@/components/PageGuide';
import { PipelineBoard } from '@/components/directories/PipelineBoard';
import { TableView } from '@/components/directories/TableView';
import { WorkspaceModal } from '@/components/directories/WorkspaceModal';
import { DirectorySubmission } from '@/types/distribution';
import { DropResult } from '@hello-pangea/dnd';

/* ─── Types ─── */
interface Directory {
    id?: string;
    name: string;
    url: string;
    description: string;
    category: string;
    pricing: 'Free' | 'Paid' | 'Freemium';
    domain_authority: number;
    monthly_visits?: string;
}

interface EnrichedDirectory extends Directory {
    matchScore: number;
    reasons: string[];
}

interface Answers {
    product?: string;
    goal?: 'seo' | 'users' | 'both';
    budget?: 'free' | 'paid' | 'both';
}

/* ─── Components ─── */
function DirectoryCard({ d, isSubmitted, onAdd }: { d: EnrichedDirectory; isSubmitted: boolean; onAdd: () => void }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all flex flex-col gap-4 group">
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/20">
                        {d.name[0]}
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm group-hover:text-indigo-400 transition-colors line-clamp-1">{d.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-white/40 uppercase tracking-wider font-medium">{d.pricing}</span>
                            <span className="text-white/20 text-[10px]">•</span>
                            <span className="text-[10px] text-indigo-400/80 font-bold">DA {d.domain_authority}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-col items-end">
                    <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${d.matchScore > 80 ? 'bg-emerald-500/10 text-emerald-400' :
                        d.matchScore > 50 ? 'bg-indigo-500/10 text-indigo-400' : 'bg-white/5 text-white/30'
                        }`}>
                        {d.matchScore}% Match
                    </div>
                </div>
            </div>

            <p className="text-xs text-white/50 line-clamp-2 leading-relaxed h-8">
                {d.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mt-auto">
                <span className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] text-white/40 border border-white/5">{d.category}</span>
                {d.reasons.slice(0, 1).map(r => (
                    <span key={r} className="px-2 py-0.5 rounded-md bg-indigo-500/5 text-[10px] text-indigo-400/60 border border-indigo-500/10 italic">
                        {r}
                    </span>
                ))}
            </div>

            <div className="flex gap-2 pt-1">
                <a
                    href={d.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white text-xs font-bold transition-all"
                >
                    <ExternalLink className="w-3.5 h-3.5" /> Visit Site
                </a>
                <button
                    onClick={onAdd}
                    disabled={isSubmitted}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${isSubmitted
                        ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 cursor-default'
                        : 'bg-indigo-500 border-indigo-400 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                        }`}
                >
                    {isSubmitted ? <><CheckCircle className="w-3.5 h-3.5" />In Pipeline</> : <><Plus className="w-3.5 h-3.5" />Add to Pipeline</>}
                </button>
            </div>
        </div>
    );
}

/* ─── Onboarding Questions ─── */
const STEPS = [
    {
        id: 'product',
        question: 'What are you launching?',
        subtitle: "We'll surface the most relevant directories for your project type",
        options: [
            { value: 'saas', label: 'Web App / SaaS', icon: '💻', desc: 'Software, cloud apps, platforms' },
            { value: 'ai', label: 'AI Tool', icon: '🤖', desc: 'LLMs, GPTs, AI agents' },
            { value: 'mobile', label: 'Mobile App', icon: '📱', desc: 'iOS, Android, cross-platform' },
            { value: 'dev', label: 'Developer Tools', icon: '🛠️', desc: 'APIs, SDKs, open source' },
            { value: 'marketing', label: 'Marketing & SEO', icon: '📈', desc: 'SEO tools, growth hacking' },
            { value: 'ecommerce', label: 'E-commerce', icon: '🛒', desc: 'Shopify, DTC, marketplaces' },
            { value: 'health', label: 'Health & Wellness', icon: '💪', desc: 'Fitness, mental health' },
            { value: 'finance', label: 'Finance & Web3', icon: '💰', desc: 'Fintech, crypto, investing' },
        ],
    },
    {
        id: 'goal',
        question: "What's your main goal?",
        subtitle: 'Should we prioritize SEO/Backlinks or getting early users?',
        options: [
            { value: 'seo', label: 'Boost SEO', icon: '🎯', desc: 'Prioritize high DA backlinks' },
            { value: 'users', label: 'Get Early Users', icon: '👥', desc: 'Focus on high-traffic directories' },
            { value: 'both', label: 'Both', icon: '⚡', desc: 'Balance SEO and user growth' },
        ],
    },
    {
        id: 'budget',
        question: "What's your budget?",
        subtitle: 'Many directories are free, some have one-time listing fees',
        options: [
            { value: 'free', label: 'Free only', icon: '🎁', desc: 'Show only 100% free directories' },
            { value: 'paid', label: 'Paid & Free', icon: '💎', desc: 'Include premium directories for faster growth' },
        ],
    },
];

export default function DirectoriesPage() {
    const { user, openAuthModal } = useAuthStore();
    const searchParams = useSearchParams();
    const subId = searchParams.get('subId');
    const userId = user?.id || 'anonymous';
    const projectId = `default_project_${userId}`;

    const [directories, setDirectories] = useState<Directory[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});
    const [search, setSearch] = useState('');
    const [pricingFilter, setPricingFilter] = useState('All');
    const [showAll, setShowAll] = useState(false);

    // Distribution Workspace States
    const [viewMode, setViewMode] = useState<'grid' | 'pipeline' | 'table'>('grid');
    const [submissions, setSubmissions] = useState<DirectorySubmission[]>([]);
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<DirectorySubmission | null>(null);

    useEffect(() => {
        // Fetch Directories (Public data)
        fetch('/api/directories?limit=1000')
            .then(r => r.json())
            .then(data => setDirectories(data.directories || []))
            .catch(console.error)
            .finally(() => setLoading(false));

        // Fetch Submissions (User data)
        if (user) {
            queryDocuments<DirectorySubmission>('directory_submissions', [
                { field: 'project_id', operator: '==', value: projectId }
            ]).then(subs => {
                setSubmissions(subs || []);
                if (subs && subs.length > 0) {
                    setStep(STEPS.length); // Skip onboarding if they have data
                }
            }).catch(err => {
                console.error('Failed to fetch submissions:', err);
            });

            // Auto open workspace if deep linked
            if (subId) {
                setIsWorkspaceOpen(true);
            }
        }
    }, [user, projectId, subId]);

    /* ─── Scoring & Filtering Logic ─── */
    const { primary, allSorted } = useMemo(() => {
        if (step < STEPS.length || !directories.length) return { primary: [], allSorted: [] };

        const scored = directories.map(d => {
            let score = 50;
            const reasons: string[] = [];

            if (answers.goal === 'seo' && d.domain_authority > 40) { score += 30; reasons.push('High Domain Authority'); }
            if (answers.goal === 'users' && d.monthly_visits && parseInt(d.monthly_visits) > 10000) { score += 30; reasons.push('High Traffic Source'); }
            if (answers.budget === 'free' && d.pricing === 'Free') { score += 20; reasons.push('100% Free'); }
            if (d.category.toLowerCase().includes(answers.product?.toLowerCase() || '')) { score += 15; reasons.push('Niche Match'); }

            return { ...d, matchScore: Math.min(score, 100), reasons };
        }).sort((a, b) => b.matchScore - a.matchScore);

        return { primary: scored.filter(d => d.matchScore > 70).slice(0, 20), allSorted: scored };
    }, [directories, answers, step]);

    const displayed = useMemo(() => {
        let pool = showAll ? allSorted : primary;
        if (pricingFilter !== 'All') pool = pool.filter(d => d.pricing === pricingFilter);
        if (search.trim()) {
            const q = search.toLowerCase();
            pool = pool.filter(d =>
                d.name.toLowerCase().includes(q) ||
                d.description.toLowerCase().includes(q) ||
                d.category.toLowerCase().includes(q)
            );
        }
        return pool;
    }, [primary, allSorted, showAll, search, pricingFilter]);

    const answer = (key: string, value: string) => {
        const next = { ...answers, [key]: value };
        setAnswers(next);
        if (step < STEPS.length - 1) setStep(s => s + 1);
        else setStep(STEPS.length);
    };

    const reset = () => { setAnswers({}); setStep(0); setShowAll(false); setPricingFilter('All'); };

    const addToPipeline = async (d: Directory) => {
        if (!user) { openAuthModal(); return; }
        if (submissions.some(s => s.directory_name === d.name)) return;

        const sub: DirectorySubmission = {
            id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            project_id: projectId,
            directory_name: d.name,
            directory_url: d.url,
            status: 'not_started',
            created_at: new Date(),
            updated_at: new Date()
        };

        setSubmissions(prev => [sub, ...prev]);
        try {
            await setDocument('directory_submissions', sub.id, sub as any);
        } catch (err) {
            console.error('Failed to save submission:', err);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;
        const { source, destination, draggableId } = result;
        if (source.droppableId === destination.droppableId) return;

        const updated = submissions.map(s => s.id === draggableId ? { ...s, status: destination.droppableId as any } : s);
        setSubmissions(updated);
        try {
            await updateDocument('directory_submissions', draggableId, { status: destination.droppableId as any });
        } catch {
            // Revert on error
            if (user) queryDocuments<DirectorySubmission>('directory_submissions', [{ field: 'project_id', operator: '==', value: projectId }]).then(s => setSubmissions(s || []));
        }
    };

    const openWorkspace = (sub: DirectorySubmission) => { setSelectedSubmission(sub); setIsWorkspaceOpen(true); };
    const closeWorkspace = () => {
        setIsWorkspaceOpen(false); setSelectedSubmission(null);
        if (user) queryDocuments<DirectorySubmission>('directory_submissions', [{ field: 'project_id', operator: '==', value: projectId }]).then(s => setSubmissions(s || []));
    };

    /* ─── ONBOARDING ─── */
    if (step < STEPS.length) {
        const cur = STEPS[step];
        const progress = (step / STEPS.length) * 100;
        return (
            <div className="min-h-screen bg-[#080810] text-white flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="h-0.5 bg-white/8">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">🌐</div>
                        <span className="font-black tracking-tight">Directory Matcher</span>
                    </div>
                    <div className="flex gap-3 text-xs text-white/30">
                        <a href="/dashboard/communities" className="hover:text-white transition-colors">Communities</a>
                        <a href="/discover" className="hover:text-white transition-colors">Discover</a>
                        <a href="/" className="hover:text-white transition-colors">← Home</a>
                    </div>
                </div>
                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-2xl">
                        <div className="flex items-center gap-2 mb-10">
                            {STEPS.map((_, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border transition-all
                                        ${i < step ? 'bg-indigo-600 border-indigo-600 text-white' : i === step ? 'border-indigo-500 text-indigo-400' : 'border-white/15 text-white/25'}`}>
                                        {i < step ? '✓' : i + 1}
                                    </div>
                                    {i < STEPS.length - 1 && <div className={`h-px w-12 ${i < step ? 'bg-indigo-500' : 'bg-white/10'}`} />}
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
                                    className="flex flex-col items-start gap-2 p-4 rounded-2xl border border-white/8 bg-white/3 hover:border-indigo-500/50 hover:bg-indigo-500/5 text-left transition-all group">
                                    <span className="text-2xl">{opt.icon}</span>
                                    <div>
                                        <p className="text-sm font-bold group-hover:text-indigo-300 transition-colors">{opt.label}</p>
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
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-lg">🌐</div>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Distribution Workspace</h1>
                        </div>
                        <p className="text-white/35 text-xs sm:text-sm ml-11">
                            Track and manage your {directories.length} curated directory submissions.
                        </p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#1a1a24] p-1.5 rounded-xl border border-white/10 self-start md:self-auto">
                        {[
                            { id: 'grid', icon: <Globe className="w-4 h-4" />, label: 'Discover' },
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
                        { label: 'Curated', val: directories.length, icon: '📂', color: 'text-indigo-400' },
                        { label: 'In Pipeline', val: submissions.length, icon: '🚀', color: 'text-violet-400' },
                        { label: 'Submitted', val: submissions.filter(s => s.status === 'submitted').length, icon: '📩', color: 'text-blue-400' },
                        { label: 'Approved', val: submissions.filter(s => s.status === 'approved' || s.status === 'live').length, icon: '✅', color: 'text-emerald-400' },
                    ].map(s => (
                        <div key={s.label} className="rounded-xl border border-white/8 bg-white/[0.02] p-3 flex items-center gap-3">
                            <span className="text-xl">{s.icon}</span>
                            <div>
                                <p className={`text-xl font-black ${s.color}`}>{s.val}</p>
                                <p className="text-[10px] text-white/35">{s.label}</p>
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
                                    placeholder="Search directories, categories, tags…"
                                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
                            </div>
                            <button onClick={reset} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white text-sm transition-colors whitespace-nowrap">
                                <RotateCcw className="w-3.5 h-3.5" /> Re-match
                            </button>
                        </div>

                        {/* Pricing Toggles */}
                        <div className="flex gap-2">
                            {['All', 'Free', 'Paid', 'Freemium'].map(p => (
                                <button key={p} onClick={() => setPricingFilter(p)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${pricingFilter === p
                                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                                        : 'border-white/10 text-white/40 hover:text-white hover:border-white/20'
                                        }`}>
                                    {p}
                                </button>
                            ))}
                        </div>

                        {/* Section label */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                                <h2 className="text-sm font-bold text-white/80">
                                    {showAll ? 'All Directories' : 'Top Recommendations'} — {displayed.length} shown
                                </h2>
                            </div>
                        </div>

                        {loading ? (
                            <div className="text-center py-20 text-white/30 text-sm animate-pulse">Scanning directories…</div>
                        ) : displayed.length === 0 ? (
                            <div className="text-center py-16 text-white/30 text-sm">
                                No directories found matching these filters.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {displayed.map(d => (
                                    <DirectoryCard
                                        key={d.url}
                                        d={d as EnrichedDirectory}
                                        isSubmitted={submissions.some(s => s.directory_url === d.url)}
                                        onAdd={() => addToPipeline(d)}
                                    />
                                ))}
                            </div>
                        )}

                        {!showAll && allSorted.length > primary.length && !search && (
                            <button onClick={() => setShowAll(true)}
                                className="w-full py-3 rounded-xl border border-white/10 text-white/40 text-sm font-medium hover:bg-white/5 hover:text-white transition-all flex justify-center items-center gap-2">
                                View All {allSorted.length} Directories <ChevronRight className="w-4 h-4" />
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
                title="Distribution Workspace"
                steps={[
                    { title: 'Launch Pipeline', description: 'Curated directories to submit your startup. Adding them to the pipeline helps you track progress.' },
                    { title: 'Match Score', description: 'How well each directory fits your project based on your questionnaire answers.' },
                    { title: 'Open Workspace', description: 'Access the full management suite to track submissions, generate AI copy, and more.' },
                ]}
            />
        </div>
    );
}
