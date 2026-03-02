'use client';

import { useState, useMemo, useEffect } from 'react';
import { ExternalLink, Plus, CheckCircle, ListTodo, X, TrendingUp, Sparkles, ArrowRight, RotateCcw, ChevronRight, LayoutGrid, Kanban, TableProperties } from 'lucide-react';
import { PipelineBoard } from '@/components/directories/PipelineBoard';
import { TableView } from '@/components/directories/TableView';
import { WorkspaceModal } from '@/components/directories/WorkspaceModal';
import { DirectorySubmission } from '@/types/distribution';
import { DropResult } from '@hello-pangea/dnd';
import { useAuthStore } from '@/lib/store/auth-store';
import { queryDocuments, setDocument, updateDocument } from '@/lib/firebase/firestore';
import { PageGuide } from '@/components/PageGuide';

/* ─── Types ─── */
interface Directory {
    name: string; description: string; category: string;
    url: string; submission_url?: string; pricing?: string; domain_authority?: number;
}
interface EnrichedDirectory extends Directory {
    difficulty: 'Easy' | 'Medium' | 'Hard';
    impact: 'High' | 'Medium' | 'Low';
}
type Answers = { product?: string; goal?: string; budget?: string };

/* ─── Enrichment ─── */
function enrich(d: Directory): EnrichedDirectory {
    const da = d.domain_authority ?? 50;
    const paid = d.pricing === 'Paid' || d.pricing === 'Revenue Share';
    return {
        ...d,
        impact: da >= 75 ? 'High' : da >= 50 ? 'Medium' : 'Low',
        difficulty: paid && da >= 70 ? 'Hard' : paid || da >= 70 ? 'Medium' : 'Easy',
    };
}

/* ─── Onboarding questions ─── */
const STEPS = [
    {
        id: 'product',
        question: "What are you distributing?",
        subtitle: "We'll tailor the best directories for you",
        options: [
            { value: 'ai-saas', label: 'AI / SaaS Tool', icon: '🤖', desc: 'Software, AI, or web app' },
            { value: 'dev-tool', label: 'Dev Tool', icon: '🛠️', desc: 'API, SDK, or developer product' },
            { value: 'agency', label: 'Agency / Service', icon: '🏢', desc: 'Consulting or freelance service' },
            { value: 'community', label: 'Community', icon: '👥', desc: 'Forum, group, or network' },
            { value: 'content', label: 'Blog / Content', icon: '✍️', desc: 'Newsletter, blog, or media' },
            { value: 'marketplace', label: 'Marketplace', icon: '🛒', desc: 'Platform connecting buyers & sellers' },
            { value: 'beta', label: 'Beta / Pre-Distribute', icon: '🧪', desc: 'Early access, seeking first testers' },
        ],
    },
    {
        id: 'goal',
        question: "What's your primary goal?",
        subtitle: "We'll prioritise for the highest return",
        options: [
            { value: 'visibility', label: 'Distribute Visibility', icon: '🚀', desc: 'Get discovered fast' },
            { value: 'seo', label: 'SEO Backlinks', icon: '🔍', desc: 'Boost search rankings' },
            { value: 'users', label: 'Get First Users', icon: '🎯', desc: 'Drive sign-ups or leads' },
            { value: 'community-growth', label: 'Community Growth', icon: '💬', desc: 'Build an engaged audience' },
            { value: 'investors', label: 'Find Investors', icon: '💰', desc: 'Reach VCs and angels' },
        ],
    },
    {
        id: 'budget',
        question: "What's your submission budget?",
        subtitle: "We'll filter out what doesn't fit",
        options: [
            { value: 'free', label: 'Free only', icon: '🆓', desc: 'No spend, max reach' },
            { value: 'small', label: 'Small budget', icon: '💳', desc: 'Up to ~$50 per listing' },
            { value: 'any', label: 'Any budget', icon: '💎', desc: 'Include premium platforms' },
        ],
    },
];

/* ─── Scoring logic ─── */
function scoreDir(dir: EnrichedDirectory, answers: Answers): number {
    let score = 0;
    const { product, goal, budget } = answers;

    if (product === 'ai-saas' && ['AI Tools', 'AI Hubs', 'Software Reviews', 'Product Launch', 'Product Distribute'].includes(dir.category)) score += 3;
    if (product === 'dev-tool' && ['Design & Dev', 'Cloud Marketplaces', 'AI Tools', 'Software Reviews'].includes(dir.category)) score += 3;
    if (product === 'agency' && ['Startup Networks', 'Directories', 'Solopreneur Hubs'].includes(dir.category)) score += 3;
    if (product === 'community' && ['Communities', 'Reddit', 'Solopreneur Hubs'].includes(dir.category)) score += 3;
    if (product === 'content' && ['SEO Guest Posts', 'AI Hubs', 'Directories'].includes(dir.category)) score += 3;
    if (product === 'marketplace' && ['Marketplaces', 'Cloud Marketplaces', 'Startup Networks'].includes(dir.category)) score += 3;
    if (product === 'beta' && ['Beta Tester', 'Product Launch', 'Product Distribute', 'Communities', 'Reddit', 'Solopreneur Hubs'].includes(dir.category)) score += 3;
    if (product === 'beta' && dir.name.toLowerCase().includes('beta')) score += 2;

    if (goal === 'visibility' && dir.impact === 'High') score += 2;
    if (goal === 'seo' && dir.category === 'SEO Guest Posts') score += 3;
    if (goal === 'seo' && (dir.domain_authority ?? 0) >= 70) score += 1;
    if (goal === 'users' && dir.difficulty === 'Easy' && dir.impact === 'High') score += 2;
    if (goal === 'community-growth' && ['Communities', 'Reddit', 'Solopreneur Hubs'].includes(dir.category)) score += 2;
    if (goal === 'investors' && ['Startup Networks', 'Marketplaces'].includes(dir.category)) score += 3;

    if (budget === 'free' && dir.pricing !== 'Free') score -= 10;
    if (budget === 'small' && dir.pricing === 'Paid' && (dir.domain_authority ?? 0) < 60) score -= 2;
    if (budget === 'any') score += 0.5;

    score += (dir.domain_authority ?? 0) / 50;
    return score;
}

/* ─── Styles ─── */
const DIFF_STYLE: Record<string, string> = { Easy: 'bg-green-500/15 text-green-300 border-green-500/25', Medium: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/25', Hard: 'bg-red-500/15 text-red-300 border-red-500/25' };
const IMPACT_STYLE: Record<string, string> = { High: 'bg-violet-500/15 text-violet-300 border-violet-500/25', Medium: 'bg-blue-500/15 text-blue-300 border-blue-500/25', Low: 'bg-gray-500/15 text-gray-400 border-gray-500/25' };
const PRICING_STYLE: Record<string, string> = { Free: 'bg-green-500/15 text-green-300', Paid: 'bg-indigo-500/15 text-indigo-300', 'Free/Paid': 'bg-blue-500/15 text-blue-300', 'Revenue Share': 'bg-orange-500/15 text-orange-300' };
const DA_COLOR = (da: number) => da >= 80 ? 'text-green-400' : da >= 60 ? 'text-blue-400' : da >= 40 ? 'text-yellow-400' : 'text-gray-500';

/* ─── Directory Card ─── */
function DirCard({ dir, isSubmitted, onToggle }: { dir: EnrichedDirectory; isSubmitted: boolean; onToggle: () => void }) {
    return (
        <div className={`relative rounded-2xl border p-4 flex flex-col gap-2.5 transition-all hover:bg-white/5 group ${isSubmitted ? 'border-indigo-500/40 bg-indigo-500/5' : 'border-white/8 bg-white/2'}`}>
            <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-white truncate group-hover:text-indigo-300 transition-colors">{dir.name}</h3>
                    <p className="text-[11px] text-white/35 line-clamp-2 mt-0.5 leading-relaxed">{dir.description}</p>
                </div>
                <span className={`flex items-center gap-0.5 flex-shrink-0 text-[11px] font-bold ${DA_COLOR(dir.domain_authority ?? 0)}`}>
                    <TrendingUp className="w-3 h-3" />{dir.domain_authority ?? '–'}
                </span>
            </div>
            <div className="flex flex-wrap gap-1">
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${DIFF_STYLE[dir.difficulty]}`}>⚡ {dir.difficulty}</span>
                <span className={`text-[9px] px-2 py-0.5 rounded-full border font-semibold ${IMPACT_STYLE[dir.impact]}`}>🎯 {dir.impact}</span>
                {dir.pricing && <span className={`text-[9px] px-2 py-0.5 rounded-full font-medium ${PRICING_STYLE[dir.pricing] || 'bg-gray-700/50 text-gray-400'}`}>{dir.pricing}</span>}
            </div>
            <div className="flex gap-2 mt-auto pt-2">
                <button
                    onClick={onToggle}
                    disabled={isSubmitted}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${isSubmitted
                        ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-300 opacity-60 cursor-not-allowed'
                        : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300 hover:bg-indigo-500/22'
                        }`}
                >
                    {isSubmitted ? <><CheckCircle className="w-3.5 h-3.5" />In Pipeline</> : <><Plus className="w-3.5 h-3.5" />Add to Pipeline</>}
                </button>
            </div>
        </div>
    );
}


export default function DirectoriesPage() {
    const { user, openAuthModal } = useAuthStore();
    const userId = user?.id || 'anonymous';
    const projectId = `default_project_${userId}`;
    const [directories, setDirectories] = useState<EnrichedDirectory[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});

    // Distribution Workspace States
    const [viewMode, setViewMode] = useState<'grid' | 'pipeline' | 'table'>('grid');
    const [submissions, setSubmissions] = useState<DirectorySubmission[]>([]);
    const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState<DirectorySubmission | null>(null);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        // Fetch Directories (Public data)
        fetch('/api/directories?limit=1000')
            .then(r => r.json())
            .then(data => setDirectories((data.directories || []).map(enrich)))
            .catch(() => { });

        // Fetch Submissions (User data)
        if (user) {
            queryDocuments<DirectorySubmission>('directory_submissions', [
                { field: 'project_id', operator: '==', value: projectId }
            ]).then(subs => {
                setSubmissions(subs || []);
            }).catch(err => {
                console.error('Failed to fetch submissions:', err);
            }).finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, [user, projectId]);

    const isSubmitted = (name: string) => submissions.some(s => s.directory_name === name);

    const addToPipeline = async (dir: EnrichedDirectory) => {
        if (!user) {
            openAuthModal();
            return;
        }
        if (isSubmitted(dir.name)) return;

        const newSubmission: DirectorySubmission = {
            id: `sub_${Date.now()}_${Math.random().toString(36).substring(7)}`,
            project_id: projectId,
            directory_id: dir.url,
            directory_name: dir.name,
            directory_url: dir.url || '',
            status: 'not_started',
            created_at: new Date(),
            updated_at: new Date()
        };

        try {
            await setDocument('directory_submissions', newSubmission.id, newSubmission);
            setSubmissions(prev => [newSubmission, ...prev]);
        } catch (err: any) {
            console.error('Failed to add to pipeline:', err);
            if (err.message && err.message.includes('Missing or insufficient permissions')) {
                alert('Firebase Error: Insufficient permissions to write to directory_submissions. Please update your Firestore Security Rules in the Firebase Console (Build -> Firestore Database -> Rules) to allow reads/writes.');
            }
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        if (!result.destination) return;

        const { source, destination, draggableId } = result;
        if (source.droppableId === destination.droppableId) return;

        // Optimistic UI update
        const updatedSubs = submissions.map(sub =>
            sub.id === draggableId ? { ...sub, status: destination.droppableId as any } : sub
        );
        setSubmissions(updatedSubs);

        // Backend update
        try {
            await updateDocument('directory_submissions', draggableId, {
                status: destination.droppableId as any
            });
        } catch (err: any) {
            console.error('Failed to update status:', err);
            if (err.message?.includes('Missing or insufficient permissions')) {
                alert('Firebase Error: Could not save status change. Please update your Firestore Security Rules.');
            }
            // Revert on error
            setSubmissions(submissions);
        }
    };

    const openWorkspace = (sub: DirectorySubmission) => {
        setSelectedSubmission(sub);
        setIsWorkspaceOpen(true);
    };

    const closeWorkspace = () => {
        setIsWorkspaceOpen(false);
        setSelectedSubmission(null);
        // Refresh submissions from client-side firestore
        if (user) {
            queryDocuments<DirectorySubmission>('directory_submissions', [
                { field: 'project_id', operator: '==', value: projectId }
            ]).then(subs => {
                setSubmissions(subs || []);
            });
        }
    };

    /* ── Scoring logic ── */
    const { primary, suggestions, allSorted } = useMemo(() => {
        if (step < 3 || !directories.length) return { primary: [], suggestions: [], allSorted: [] };
        const scored = directories.map(d => ({ d, score: scoreDir(d, answers) })).filter(x => x.score > -5).sort((a, b) => b.score - a.score);
        const allSorted = scored.map(x => x.d);
        const threshold = Math.max(scored[0]?.score * 0.35, 1);
        const primary = scored.filter(x => x.score >= threshold).slice(0, 15).map(x => x.d);
        const primSet = new Set(primary.map(d => d.name));
        const fill = allSorted.filter(d => !primSet.has(d.name));
        while (primary.length < 6 && fill.length) primary.push(fill.shift()!);
        const primSet2 = new Set(primary.map(d => d.name));
        const suggestions = allSorted.filter(d => !primSet2.has(d.name)).slice(0, 9);
        return { primary, suggestions, allSorted };
    }, [directories, answers, step]);

    const answer = (key: string, value: string) => {
        const newAnswers = { ...answers, [key]: value };
        if (key === 'product' && value === 'beta') { setAnswers({ product: 'beta', goal: 'users', budget: 'free' }); setStep(3); return; }
        setAnswers(newAnswers);
        if (step < 2) setStep(s => s + 1); else setStep(3);
    };

    const reset = () => { setAnswers({}); setStep(0); setShowAll(false); };
    const currentStep = STEPS[step];

    // ── Onboarding ──
    if (step < 3) {
        const progress = ((step) / STEPS.length) * 100;
        return (
            <div className="min-h-screen bg-[#080810] text-white flex flex-col pt-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="h-0.5 bg-white/8">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-2xl">
                        <div className="flex items-center gap-2 mb-8">
                            {STEPS.map((s, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border ${i < step ? 'bg-indigo-600 border-indigo-600' : i === step ? 'border-indigo-500 text-indigo-400' : 'border-white/15 text-white/25'}`}>
                                        {i < step ? '✓' : i + 1}
                                    </div>
                                    {i < STEPS.length - 1 && <div className={`flex-1 h-px w-8 ${i < step ? 'bg-indigo-500' : 'bg-white/10'}`} />}
                                </div>
                            ))}
                        </div>
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-black mb-2 tracking-tight">{currentStep.question}</h1>
                            <p className="text-white/40 text-sm">{currentStep.subtitle}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {currentStep.options.map(opt => (
                                <button key={opt.value} onClick={() => answer(currentStep.id, opt.value)} className="flex flex-col items-start gap-2 p-4 rounded-2xl border border-white/8 bg-white/3 hover:border-indigo-500/40 text-left transition-all group">
                                    <span className="text-2xl">{opt.icon}</span>
                                    <div>
                                        <p className="text-sm font-bold group-hover:text-indigo-300">{opt.label}</p>
                                        <p className="text-[11px] text-white/35 mt-0.5">{opt.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#080810] text-white pt-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

                {/* Header & View Toggles */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">Distribution Workplace</h1>
                        <p className="text-white/40 text-xs sm:text-sm">Manage, track, and optimize your directory submissions.</p>
                    </div>

                    <div className="flex items-center gap-1 sm:gap-2 bg-[#1a1a24] p-1.5 rounded-xl border border-white/10 self-start md:self-auto w-full md:w-auto overflow-x-auto overflow-y-hidden scrollbar-hide">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'grid' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                        >
                            <LayoutGrid className="w-4 h-4" /> Discover
                        </button>
                        <button
                            onClick={() => setViewMode('pipeline')}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${viewMode === 'pipeline' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                        >
                            <Kanban className="w-4 h-4" /> Pipeline
                        </button>
                        <button
                            onClick={() => setViewMode('table')}
                            className={`flex whitespace-nowrap items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${viewMode === 'table' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/80'}`}
                        >
                            <TableProperties className="w-4 h-4" /> List
                        </button>
                    </div>
                </div>

                {/* Content based on View Mode */}
                <div className="flex-1">
                    {viewMode === 'grid' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                                <h2 className="text-base sm:text-lg font-bold flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" /> Curated Directories
                                </h2>
                                <button onClick={reset} className="text-[11px] sm:text-xs text-white/40 hover:text-white transition-colors flex items-center gap-1.5 self-start sm:self-auto">
                                    <RotateCcw className="w-3.5 h-3.5" /> Retake Questionnaire
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {(showAll ? allSorted : primary).map((dir, i) => (
                                    <DirCard
                                        key={dir.name + i}
                                        dir={dir}
                                        isSubmitted={isSubmitted(dir.name)}
                                        onToggle={() => addToPipeline(dir)}
                                    />
                                ))}
                            </div>

                            {!showAll && primary.length > 0 && (
                                <button
                                    onClick={() => setShowAll(true)}
                                    className="w-full py-3 rounded-xl border border-white/10 text-white/50 text-sm font-medium hover:bg-white/5 hover:text-white transition-all flex justify-center items-center gap-2"
                                >
                                    View All {allSorted.length} Directories <ChevronRight className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    )}

                    {viewMode === 'pipeline' && (
                        <div className="h-full">
                            <PipelineBoard
                                submissions={submissions}
                                onDragEnd={handleDragEnd}
                                onOpenWorkspace={openWorkspace}
                            />
                        </div>
                    )}

                    {viewMode === 'table' && (
                        <div>
                            <TableView
                                submissions={submissions}
                                onOpenWorkspace={openWorkspace}
                            />
                        </div>
                    )}
                </div>

            </main>

            {/* Workspace Modal */}
            <WorkspaceModal
                isOpen={isWorkspaceOpen}
                onClose={closeWorkspace}
                submission={selectedSubmission}
                userId={userId}
            />

            <PageGuide
                title="Directories"
                steps={[
                    { title: 'Questionnaire', description: 'If you havent already, answer the 3 quick questions. We will use this to sort the directory targets by the highest ROI for your startup.' },
                    { title: 'Grid View', description: 'Browse the top directory targets and click Add to Pipeline for the ones you want to submit to.' },
                    { title: 'Pipeline View', description: 'Switch to Pipeline to see your kanban board. Drag and drop targets as you submit to them to track your progress.' },
                    { title: 'Workspace Modal', description: 'Click any target in your Pipeline to open a popup workspace. We generate submission copy for you automatically!' },
                ]}
            />
        </div>
    );
}
