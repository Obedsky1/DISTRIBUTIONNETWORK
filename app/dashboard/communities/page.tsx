'use client';

import { useState, useEffect, useMemo } from 'react';
import { ExternalLink, Plus, CheckCircle, ListTodo, X, Users, Sparkles, ArrowRight, RotateCcw, ChevronRight } from 'lucide-react';

/* ─── Types ─── */
interface Community {
    id: string; name: string; platform: string; description: string;
    url: string; invite_link?: string; member_count: number;
    categories: string[]; use_cases?: string[];
}
type Answers = { goal?: string; platform?: string; size?: string };

/* ─── Onboarding Steps ─── */
const STEPS = [
    {
        id: 'goal',
        question: "What's your distribution goal?",
        subtitle: "We'll find the best channels to help you achieve it",
        options: [
            { value: 'clients', label: 'Find Clients', icon: '💼', desc: 'Get leads or freelance work' },
            { value: 'audience', label: 'Build Audience', icon: '📢', desc: 'Grow followers & brand' },
            { value: 'beta', label: 'Get Beta Users', icon: '🧪', desc: 'Find testers for your product' },
            { value: 'learn', label: 'Learn & Network', icon: '🎓', desc: 'Connect with peers' },
            { value: 'hire', label: 'Hire Talent', icon: '🤝', desc: 'Find collaborators or team' },
            { value: 'feedback', label: 'Get Feedback', icon: '💬', desc: 'Improve your product or idea' },
        ],
    },
    {
        id: 'platform',
        question: "Preferred platform?",
        subtitle: "Pick where you're most comfortable engaging",
        options: [
            { value: 'Reddit', label: 'Reddit', icon: '🔴', desc: 'High-traffic subreddits' },
            { value: 'Discord', label: 'Discord', icon: '💬', desc: 'Chat-first communities' },
            { value: 'Telegram', label: 'Telegram', icon: '✈️', desc: 'Fast, mobile groups' },
            { value: 'Facebook', label: 'Facebook', icon: '📘', desc: 'Large interest groups' },
            { value: 'Directory', label: 'Directories', icon: '📁', desc: 'Submission platforms' },
            { value: 'any', label: 'Any Platform', icon: '🌐', desc: 'Show me everything' },
        ],
    },
    {
        id: 'size',
        question: "What community size suits you?",
        subtitle: "Bigger isn't always better — niche can convert better",
        options: [
            { value: 'huge', label: 'Massive (100K+)', icon: '🌊', desc: 'Maximum reach & visibility' },
            { value: 'medium', label: 'Medium (10K–100K)', icon: '🏙️', desc: 'Good reach, less noise' },
            { value: 'small', label: 'Niche (<10K)', icon: '💎', desc: 'Highly engaged audience' },
            { value: 'any', label: 'Any Size', icon: '🎯', desc: 'Show me the best fits' },
        ],
    },
];

/* ─── Scoring ─── */
function scoreComm(c: Community, a: Answers): number {
    let score = 0;
    const { goal, platform, size } = a;

    // goal → category mapping
    if (goal === 'clients' && c.use_cases?.some(u => /client|lead|business|b2b/i.test(u))) score += 3;
    if (goal === 'clients' && c.categories.some(cat => /saas|business|freelanc|agency/i.test(cat))) score += 2;
    if (goal === 'audience' && c.use_cases?.some(u => /audience|brand|growth|market/i.test(u))) score += 3;
    if (goal === 'audience' && c.categories.some(cat => /market|content|social/i.test(cat))) score += 2;
    if (goal === 'beta' && c.use_cases?.some(u => /beta|test|feedback|early/i.test(u))) score += 3;
    if (goal === 'beta' && c.categories.some(cat => /startup|product|maker/i.test(cat))) score += 2;
    if (goal === 'learn' && c.categories.some(cat => /learn|develop|community|network/i.test(cat))) score += 3;
    if (goal === 'hire' && c.use_cases?.some(u => /hire|talent|team|recruit/i.test(u))) score += 3;
    if (goal === 'hire' && c.categories.some(cat => /developer|design|tech|engineer/i.test(cat))) score += 2;
    if (goal === 'feedback' && c.use_cases?.some(u => /feedback|review|improve|critique/i.test(u))) score += 3;
    if (goal === 'feedback' && c.categories.some(cat => /product|startup|maker/i.test(cat))) score += 2;

    // platform
    if (platform && platform !== 'any' && c.platform === platform) score += 4;
    else if (platform === 'any') score += 0;

    // size
    const m = c.member_count;
    if (size === 'huge' && m >= 100_000) score += 2;
    if (size === 'medium' && m >= 10_000 && m < 100_000) score += 2;
    if (size === 'small' && m < 10_000) score += 2;
    if (size === 'any') score += 0.5;

    // baseline
    score += Math.log10(Math.max(c.member_count, 1)) * 0.3;

    return score;
}

/* ─── Helpers ─── */
const formatCount = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);

const PLATFORM_COLOR: Record<string, string> = {
    Reddit: 'from-orange-500 to-red-600',
    Discord: 'from-indigo-500 to-purple-600',
    Telegram: 'from-blue-400 to-blue-600',
    Facebook: 'from-blue-500 to-blue-800',
    Directory: 'from-emerald-500 to-teal-600',
};
const platColor = (p: string) => PLATFORM_COLOR[p] ?? 'from-gray-500 to-gray-700';

/* ─── Community Card ─── */
function CommCard({ c, inPlan, onToggle }: { c: Community; inPlan: boolean; onToggle: () => void }) {
    return (
        <div className={`relative rounded-2xl border p-4 flex flex-col gap-2.5 transition-all hover:bg-white/5 group ${inPlan ? 'border-violet-500/40 bg-violet-500/5' : 'border-white/8 bg-white/2'}`}>
            <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium bg-gradient-to-r ${platColor(c.platform)} text-white`}>{c.platform}</span>
                <span className="flex items-center gap-1 text-white/40 text-[11px]"><Users className="w-3 h-3" />{formatCount(c.member_count)}</span>
            </div>
            <div>
                <h3 className="font-bold text-sm text-white group-hover:text-violet-300 transition-colors truncate">{c.name}</h3>
                <p className="text-[11px] text-white/40 line-clamp-2 mt-0.5 leading-relaxed">{c.description}</p>
            </div>
            <div className="flex flex-wrap gap-1">
                {c.categories.slice(0, 3).map(cat => (
                    <span key={cat} className="text-[9px] px-2 py-0.5 rounded-full bg-white/6 text-white/40">{cat}</span>
                ))}
            </div>
            {c.use_cases && c.use_cases.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {c.use_cases.slice(0, 2).map(u => (
                        <span key={u} className="text-[9px] px-2 py-0.5 rounded border border-purple-500/25 bg-purple-500/10 text-purple-300">{u}</span>
                    ))}
                </div>
            )}
            <div className="flex gap-2 mt-auto">
                <button onClick={onToggle}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-[11px] font-semibold border transition-all ${inPlan ? 'bg-green-500/12 border-green-500/25 text-green-300 hover:bg-red-500/12 hover:border-red-500/25 hover:text-red-300' : 'bg-violet-500/10 border-violet-500/20 text-violet-300 hover:bg-violet-500/22'}`}>
                    {inPlan ? <><CheckCircle className="w-3.5 h-3.5" />Saved</> : <><Plus className="w-3.5 h-3.5" />Save</>}
                </button>
                <a href={c.invite_link || c.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[11px] font-medium bg-white/5 border border-white/8 text-white/50 hover:text-white hover:bg-white/10 transition-all">
                    <ExternalLink className="w-3 h-3" />Join
                </a>
            </div>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════ */

export default function CommunitiesPage() {
    const [communities, setCommunities] = useState<Community[]>([]);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<Answers>({});
    const [saved, setSaved] = useState<Community[]>([]);
    const [panelOpen, setPanelOpen] = useState(false);
    const [showAll, setShowAll] = useState(false);

    useEffect(() => {
        fetch('/api/communities?limit=500&sortBy=member_count&sortOrder=desc')
            .then(r => r.json())
            .then(data => setCommunities(data.communities || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, []);

    const inSaved = (c: Community) => saved.some(s => s.id === c.id);
    const toggleSaved = (c: Community) =>
        setSaved(prev => inSaved(c) ? prev.filter(s => s.id !== c.id) : [...prev, c]);

    /* Scoring */
    const { primary, suggestions } = useMemo(() => {
        if (step < 3 || !communities.length) return { primary: [], suggestions: [] };
        const scored = communities
            .map(c => ({ c, score: scoreComm(c, answers) }))
            .sort((a, b) => b.score - a.score);

        const threshold = Math.max((scored[0]?.score ?? 0) * 0.35, 0.5);
        const primary: Community[] = scored.filter(x => x.score >= threshold).slice(0, 12).map(x => x.c);

        // guarantee at least 6
        const primSet = new Set(primary.map(c => c.id));
        const fill = scored.filter(x => !primSet.has(x.c.id));
        while (primary.length < 6 && fill.length) primary.push(fill.shift()!.c);

        const primSet2 = new Set(primary.map(c => c.id));
        const suggestions = scored.filter(x => !primSet2.has(x.c.id)).slice(0, 9).map(x => x.c);
        return { primary, suggestions };
    }, [communities, answers, step]);

    const answerStep = (key: string, value: string) => {
        const newAns = { ...answers, [key]: value };
        setAnswers(newAns);
        if (step < 2) setStep(s => s + 1);
        else setStep(3);
    };

    const reset = () => { setAnswers({}); setStep(0); setShowAll(false); };
    const currentStep = STEPS[step];

    /* ── Onboarding ── */
    if (step < 3) {
        const progress = (step / STEPS.length) * 100;
        return (
            <div className="min-h-screen bg-[#080810] text-white flex flex-col" style={{ fontFamily: 'Inter, sans-serif' }}>
                <div className="h-0.5 bg-white/8">
                    <div className="h-full bg-gradient-to-r from-indigo-500 to-blue-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                </div>

                <div className="flex-1 flex items-center justify-center px-4 py-12">
                    <div className="w-full max-w-2xl">
                        {/* Step dots */}
                        <div className="flex items-center gap-2 mb-8">
                            {STEPS.map((s, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${i < step ? 'bg-purple-600 border-purple-600 text-white' : i === step ? 'border-purple-500 text-purple-400' : 'border-white/15 text-white/25'}`}>
                                        {i < step ? '✓' : i + 1}
                                    </div>
                                    {i < STEPS.length - 1 && <div className={`w-8 h-px ${i < step ? 'bg-purple-500' : 'bg-white/10'}`} />}
                                </div>
                            ))}
                            <span className="ml-2 text-[11px] text-white/30">{step + 1} of {STEPS.length}</span>
                        </div>

                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-black mb-2" style={{ letterSpacing: '-0.03em' }}>{currentStep.question}</h1>
                            <p className="text-white/40 text-sm">{currentStep.subtitle}</p>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {currentStep.options.map(opt => (
                                <button key={opt.value} onClick={() => answerStep(currentStep.id, opt.value)}
                                    className="flex flex-col items-start gap-2 p-4 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/8 hover:border-purple-500/40 transition-all text-left group active:scale-95">
                                    <span className="text-2xl">{opt.icon}</span>
                                    <div>
                                        <p className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">{opt.label}</p>
                                        <p className="text-[11px] text-white/35 mt-0.5">{opt.desc}</p>
                                    </div>
                                    <ChevronRight className="w-3.5 h-3.5 text-white/20 group-hover:text-purple-400 mt-auto self-end" />
                                </button>
                            ))}
                        </div>

                        <div className="mt-6 text-center">
                            <button onClick={() => setStep(s => s === 2 ? 3 : s + 1)} className="text-[11px] text-white/25 hover:text-white/50 transition-colors">
                                Skip this question →
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ── Results ── */
    const answerSummary = [
        STEPS[0].options.find(o => o.value === answers.goal),
        STEPS[1].options.find(o => o.value === answers.platform),
        STEPS[2].options.find(o => o.value === answers.size),
    ].filter(Boolean);

    return (
        <div className="flex min-h-screen bg-[#080810] text-white" style={{ fontFamily: 'Inter, sans-serif' }}>

            {/* Saved sidebar */}
            {panelOpen && <div className="fixed inset-0 bg-black/60 z-30 md:hidden" onClick={() => setPanelOpen(false)} />}
            <aside className={`fixed md:sticky top-0 left-0 z-40 md:z-auto h-screen flex-shrink-0 flex flex-col border-r border-white/8 transition-transform duration-300 md:translate-x-0 ${panelOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                style={{ width: 256, background: 'rgba(8,6,24,0.98)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/8">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-blue-700 flex items-center justify-center">
                            <ListTodo className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-sm">My Distribution Plan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold">{saved.length}</span>
                        <button className="md:hidden p-1 text-white/30 hover:text-white" onClick={() => setPanelOpen(false)}><X className="w-4 h-4" /></button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                    {saved.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-44 text-center gap-2">
                            <ListTodo className="w-8 h-8 text-white/10" />
                            <p className="text-white/25 text-[11px]">Add channels to<br />your distribution plan</p>
                        </div>
                    ) : (
                        <ul className="space-y-1.5">
                            {saved.map((c, i) => (
                                <li key={c.id} className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/6 group">
                                    <span className="text-[9px] font-bold text-white/25 w-3.5 pt-0.5 flex-shrink-0">{i + 1}.</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[11px] font-semibold truncate">{c.name}</p>
                                        <p className="text-[9px] text-white/35 mt-0.5">{c.platform} · {formatCount(c.member_count)}</p>
                                    </div>
                                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 flex-shrink-0">
                                        <a href={c.invite_link || c.url} target="_blank" rel="noopener noreferrer" className="p-1 text-white/30 hover:text-purple-400"><ExternalLink className="w-3 h-3" /></a>
                                        <button onClick={() => toggleSaved(c)} className="p-1 text-white/30 hover:text-red-400"><X className="w-3 h-3" /></button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {saved.length > 0 && (
                    <div className="p-3 border-t border-white/8">
                        <button onClick={() => setSaved([])} className="w-full py-1.5 rounded-xl text-[11px] text-white/30 hover:text-red-400 border border-white/8 hover:border-red-500/30 transition-all">Clear All</button>
                    </div>
                )}
            </aside>

            {/* Main */}
            <main className="flex-1 overflow-y-auto">
                <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto space-y-6">

                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                                <h1 className="text-2xl font-black" style={{ letterSpacing: '-0.03em' }}>Your Distribution Channels</h1>
                                {answerSummary.map((a, i) => (
                                    <span key={i} className="text-[11px] px-2.5 py-1 rounded-full bg-white/8 border border-white/10 text-white/60">{a!.icon} {a!.label}</span>
                                ))}
                            </div>
                            <p className="text-white/35 text-sm mt-1">{primary.length} top channels · {suggestions.length} more options</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                            <button onClick={reset} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 text-white/40 hover:text-white text-xs transition-all">
                                <RotateCcw className="w-3.5 h-3.5" /> Redo
                            </button>
                            <button onClick={() => setPanelOpen(true)} className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-semibold">
                                <ListTodo className="w-3.5 h-3.5" /> Saved ({saved.length})
                            </button>
                        </div>
                    </div>

                    {/* Primary */}
                    <section>
                        <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="w-4 h-4 text-purple-400" />
                            <h2 className="text-sm font-bold">Top Channels for Your Goal</h2>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300">{primary.length}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {(showAll ? primary : primary.slice(0, 6)).map(c => (
                                <CommCard key={c.id} c={c} inPlan={inSaved(c)} onToggle={() => toggleSaved(c)} />
                            ))}
                        </div>
                        {primary.length > 6 && !showAll && (
                            <button onClick={() => setShowAll(true)}
                                className="mt-3 w-full py-2.5 rounded-xl border border-white/8 text-white/40 hover:text-white text-xs transition-all hover:border-white/20">
                                Show {primary.length - 6} more matches
                            </button>
                        )}
                    </section>

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <section>
                            <div className="flex items-center gap-2 mb-3">
                                <ArrowRight className="w-4 h-4 text-white/35" />
                                <h2 className="text-sm font-bold text-white/60">You Might Also Want</h2>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/8 text-white/35">{suggestions.length}</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                {suggestions.map(c => (
                                    <CommCard key={c.id} c={c} inPlan={inSaved(c)} onToggle={() => toggleSaved(c)} />
                                ))}
                            </div>
                        </section>
                    )}

                    <div className="text-center pt-2 pb-6">
                        <p className="text-white/20 text-xs mb-2">Not what you need?</p>
                        <button onClick={reset} className="text-xs text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors">
                            Start over to find different channels →
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
