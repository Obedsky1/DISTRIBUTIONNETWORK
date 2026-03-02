'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import {
    Search, ExternalLink, TrendingUp, ChevronLeft,
    Sparkles, FileText, MessageSquare, BookOpen, Zap,
    Globe, X, AlertTriangle, Copy, Check, RefreshCw, Home
} from 'lucide-react';
import { PageGuide } from '@/components/PageGuide';

interface Directory {
    id: string;
    name: string;
    platform: string;
    description: string;
    url: string;
    category: string;
    pricing: string;
    domain_authority: number;
    submission_url?: string;
}

interface SitePreview {
    title: string | null;
    description: string | null;
    image: string | null;
    favicon: string | null;
    origin: string | null;
}

interface AnalysisResult {
    positioning: string;
    targetAudience: string;
    usp: string[];
    keywords: string[];
    contentAngles: string[];
    toneRecommendation: string;
    note?: string;
}

type GenerateMode = 'comment' | 'post' | 'story' | 'content';
type AITab = 'analyze' | 'generate';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const CATEGORY_ICONS: Record<string, string> = {
    'Product Distribute': '🚀',
    'SEO Guest Posts': '📝',
    'Software Reviews': '⭐',
    'Startup Networks': '🏢',
    'Cloud Marketplaces': '☁️',
    'Design & Dev': '🎨',
    'AI Tools': '🤖',
    'Solopreneur Hubs': '💼',
    'Directories': '📂',
    'Communities': '👥',
    'Reddit': '🔴',
    'AI Hubs': '🧠',
    'Marketplaces': '🛒',
};

const PRICING_COLORS: Record<string, string> = {
    'Free': 'bg-green-500/20 text-green-300 border border-green-500/30',
    'Paid': 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
    'Free/Paid': 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
    'Revenue Share': 'bg-orange-500/20 text-orange-300 border border-orange-500/30',
};

export default function WorkspacePage() {
    // ----- Panel resize state -----
    const containerRef = useRef<HTMLDivElement>(null);
    const [panelWidths, setPanelWidths] = useState([22, 45, 33]); // %
    const dragging = useRef<number | null>(null);
    const startX = useRef(0);
    const startWidths = useRef<number[]>([]);

    const [mobileActivePanel, setMobileActivePanel] = useState<'list' | 'preview' | 'ai'>('list');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile(); // Check on mount
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // ----- Directory list state -----
    const [directories, setDirectories] = useState<Directory[]>([]);
    const [search, setSearch] = useState('');
    const [activeLetterFilter, setActiveLetterFilter] = useState('');
    const letterRefs = useRef<Record<string, HTMLDivElement | null>>({});

    // ----- Iframe state -----
    const [selectedDir, setSelectedDir] = useState<Directory | null>(null);
    const [iframeBlocked, setIframeBlocked] = useState(false);
    const [sitePreview, setSitePreview] = useState<SitePreview | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // ----- AI Studio state -----
    const [aiTab, setAiTab] = useState<AITab>('analyze');
    const [saasName, setSaasName] = useState('');
    const [saasUrl, setSaasUrl] = useState('');
    const [saasDesc, setSaasDesc] = useState('');
    const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [analyzeError, setAnalyzeError] = useState('');

    const [generateMode, setGenerateMode] = useState<GenerateMode>('post');
    const [generating, setGenerating] = useState(false);
    const [generated, setGenerated] = useState('');
    const [generateError, setGenerateError] = useState('');
    const [copied, setCopied] = useState(false);

    // ----- Auth store and routing -----
    const { user, openAuthModal, loading } = useAuthStore();
    const router = useRouter();

    // ----- Require Auth -----
    useEffect(() => {
        if (!loading && !user) {
            openAuthModal();
            router.push('/');
        }
    }, [user, loading, router, openAuthModal]);



    // ----- Load directories -----
    useEffect(() => {
        fetch('/api/directories?limit=1000&sortBy=name&sortOrder=asc')
            .then(r => r.json())
            .then(data => setDirectories(data.directories || []))
            .catch(() => { });
    }, []);

    // ----- Sync AI Studio with User Profile -----
    useEffect(() => {
        if (user?.startup) {
            if (!saasName) setSaasName(user.startup.name || '');
            if (!saasUrl) setSaasUrl(user.startup.websiteUrl || '');
            if (!saasDesc) setSaasDesc(user.startup.description || '');
        }
    }, [user, saasName, saasUrl, saasDesc]);

    // ----- Filtered + sorted directories -----
    const filtered = directories
        .filter(d => {
            const q = search.toLowerCase();
            const matchSearch = !q || d.name.toLowerCase().includes(q) || d.category.toLowerCase().includes(q);
            const matchLetter = !activeLetterFilter || d.name.toUpperCase().startsWith(activeLetterFilter);
            return matchSearch && matchLetter;
        })
        .sort((a, b) => a.name.localeCompare(b.name));

    // Group by first letter for jump links
    const letterGroups = filtered.reduce<Record<string, Directory[]>>((acc, d) => {
        const letter = d.name[0].toUpperCase();
        if (!acc[letter]) acc[letter] = [];
        acc[letter].push(d);
        return acc;
    }, {});

    // ----- Panel resize drag -----
    const onDividerMouseDown = useCallback((dividerIndex: number, e: React.MouseEvent) => {
        e.preventDefault();
        dragging.current = dividerIndex;
        startX.current = e.clientX;
        startWidths.current = [...panelWidths];
    }, [panelWidths]);

    useEffect(() => {
        const onMove = (e: MouseEvent) => {
            if (dragging.current === null || !containerRef.current) return;
            const totalW = containerRef.current.clientWidth;
            const dx = ((e.clientX - startX.current) / totalW) * 100;
            const newWidths = [...startWidths.current];
            const i = dragging.current;
            const minW = 14;
            newWidths[i] = Math.max(minW, newWidths[i] + dx);
            newWidths[i + 1] = Math.max(minW, newWidths[i + 1] - dx);
            // clamp so total stays 100
            const sum = newWidths.reduce((a, b) => a + b, 0);
            const scale = 100 / sum;
            setPanelWidths(newWidths.map(w => w * scale));
        };
        const onUp = () => { dragging.current = null; };
        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, []);

    // ----- Open directory in iframe -----
    const openDirectory = (dir: Directory) => {
        setSelectedDir(dir);
        setIframeBlocked(false);
        setSitePreview(null);
        if (isMobile) {
            setMobileActivePanel('preview');
        }
    };

    // ----- Fetch site metadata when iframe is blocked -----
    const fetchSitePreview = useCallback(async (url: string) => {
        setPreviewLoading(true);
        try {
            const res = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);
            const data = await res.json();
            if (!data.error) setSitePreview(data);
        } catch { /* silently fail */ } finally {
            setPreviewLoading(false);
        }
    }, []);

    // ----- AI Analyze -----
    const handleAnalyze = async () => {
        setAnalyzing(true);
        setAnalyzeError('');
        setAnalysis(null);
        try {
            const res = await fetch('/api/ai/saas-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: saasName, url: saasUrl, description: saasDesc }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Analysis failed');
            setAnalysis(data.data);
            setAiTab('generate');
        } catch (err) {
            setAnalyzeError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setAnalyzing(false);
        }
    };

    // ----- AI Generate Content -----
    const handleGenerate = async (mode: GenerateMode) => {
        setGenerateMode(mode);
        setGenerating(true);
        setGenerateError('');
        setGenerated('');
        try {
            const contextMap: Record<GenerateMode, string> = {
                comment: 'Write a genuine, helpful community comment promoting this product without being spammy. 2-3 sentences.',
                post: 'Write an engaging social media post (LinkedIn/Twitter style) promoting this product. Use emojis, keep it punchy, max 4 sentences.',
                story: 'Write a short founder story / narrative about the problem this product solves. Make it relatable and personal, 3-4 sentences.',
                content: 'Write a detailed blog intro paragraph (5-6 sentences) that highlights the value of this product and draws readers in.',
            };

            const res = await fetch('/api/ai/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: mode === 'content' ? 'description' : mode,
                    context: {
                        productName: saasName || analysis?.positioning?.split(' ')[0] || 'Product',
                        brandVoice: analysis?.toneRecommendation || 'casual',
                        targetAudience: analysis?.targetAudience || 'founders and builders',
                        topic: contextMap[mode],
                        additionalContext: analysis
                            ? `USPs: ${analysis.usp?.join(', ')}. Keywords: ${analysis.keywords?.join(', ')}.`
                            : saasDesc,
                    },
                }),
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error || 'Generation failed');
            const content = data.data?.content || data.data?.text || data.data || '';
            setGenerated(typeof content === 'string' ? content : JSON.stringify(content));
        } catch (err) {
            setGenerateError(err instanceof Error ? err.message : 'Generation failed');
        } finally {
            setGenerating(false);
        }
    };

    const handleCopy = async () => {
        if (!generated) return;
        await navigator.clipboard.writeText(generated);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ----- Scroll to letter -----
    const jumpToLetter = (letter: string) => {
        setActiveLetterFilter('');
        setTimeout(() => {
            letterRefs.current[letter]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 50);
    };

    const daColor = (da: number) => da >= 80 ? 'text-green-400' : da >= 60 ? 'text-blue-400' : da >= 40 ? 'text-yellow-400' : 'text-gray-500';

    if (loading || (!loading && !user)) {
        return null; // Don't render anything while checking auth or redirecting
    }

    return (
        <div className="h-screen bg-gray-950 flex flex-col overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>
            {/* Top bar */}
            <header className="flex-shrink-0 flex items-center gap-3 px-4 py-2.5 bg-gray-900/80 backdrop-blur border-b border-white/10 z-50">
                <a href="/" className="flex items-center gap-1.5 text-white/50 hover:text-white transition-colors text-sm">
                    <Home className="w-4 h-4" />
                    <span className="hidden sm:inline">Home</span>
                </a>
                <span className="text-white/20">|</span>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                        <Sparkles className="w-4 h-4 text-white" />
                    </div>
                    <h1 className="text-white font-bold text-sm tracking-tight">Workspace</h1>
                </div>
                <span className="text-white/20 text-xs ml-1">·</span>
                <span className="text-white/40 text-xs">Drag dividers to resize panels</span>
                {selectedDir && (
                    <div className="ml-auto flex items-center gap-2 text-xs text-white/60">
                        <Globe className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{selectedDir.name}</span>
                    </div>
                )}

                <div className={`${!selectedDir ? 'ml-auto' : 'ml-4'} flex items-center`}>
                    {user ? (
                        <Link href="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-xs font-semibold">
                            <div className="w-5 h-5 rounded-full bg-violet-600 flex items-center justify-center text-white text-[10px]">
                                {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                            </div>
                            <span className="hidden sm:inline">Profile</span>
                        </Link>
                    ) : (
                        <button onClick={openAuthModal} className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-colors text-xs font-semibold">
                            Sign In
                        </button>
                    )}
                </div>
            </header>

            {/* Main 3-panel area */}
            <div ref={containerRef} className="flex flex-1 overflow-hidden select-none">
                {/* ====== PANEL 1: Directory List ====== */}
                <div
                    className={`flex-col overflow-hidden border-r border-white/10 bg-gray-900/60 ${mobileActivePanel === 'list' ? 'flex w-full' : 'hidden md:flex'}`}
                    style={isMobile ? {} : { width: `${panelWidths[0]}%` }}
                >
                    {/* Panel header */}
                    <div className="flex-shrink-0 px-3 pt-3 pb-2 border-b border-white/10 bg-gray-900/80">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-xs font-semibold text-white/70 uppercase tracking-widest">Directories A–Z</h2>
                            <span className="text-[10px] text-white/30">{filtered.length}</span>
                        </div>
                        {/* Search */}
                        <div className="relative mb-2">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => { setSearch(e.target.value); setActiveLetterFilter(''); }}
                                placeholder="Search..."
                                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-white/5 text-white text-xs placeholder-gray-600 border border-white/5 focus:outline-none focus:border-indigo-500/50 focus:bg-white/8 transition-all"
                            />
                            {(search || activeLetterFilter) && (
                                <button onClick={() => { setSearch(''); setActiveLetterFilter(''); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            )}
                        </div>
                        {/* Alphabet jump */}
                        <div className="flex flex-wrap gap-0.5">
                            {ALPHABET.map(l => (
                                <button
                                    key={l}
                                    onClick={() => {
                                        if (activeLetterFilter === l) { setActiveLetterFilter(''); }
                                        else { setSearch(''); setActiveLetterFilter(l); }
                                    }}
                                    className={`w-5 h-5 rounded text-[10px] font-bold transition-all ${activeLetterFilter === l
                                        ? 'bg-indigo-600 text-white'
                                        : letterGroups[l] ? 'text-white/50 hover:bg-white/10 hover:text-white' : 'text-white/15 cursor-default'
                                        }`}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Directory list */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                        {Object.keys(letterGroups).length === 0 ? (
                            <div className="flex items-center justify-center h-32 text-white/30 text-xs">No results</div>
                        ) : (
                            Object.entries(letterGroups)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([letter, dirs]) => (
                                    <div key={letter} ref={el => { letterRefs.current[letter] = el; }}>
                                        {/* Letter header */}
                                        <div className="sticky top-0 z-10 px-3 py-1 bg-gray-950/90 backdrop-blur border-b border-white/5">
                                            <span className="text-[10px] font-bold text-indigo-400 tracking-widest">{letter}</span>
                                        </div>
                                        {dirs.map(dir => (
                                            <button
                                                key={dir.id}
                                                onClick={() => openDirectory(dir)}
                                                className={`w-full text-left px-3 py-2.5 border-b border-white/5 hover:bg-indigo-500/10 transition-all group ${selectedDir?.id === dir.id ? 'bg-indigo-500/15 border-l-2 border-l-indigo-500' : ''}`}
                                            >
                                                <div className="flex items-start justify-between gap-1">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-1 mb-0.5">
                                                            <span className="text-xs">{CATEGORY_ICONS[dir.category] || '📌'}</span>
                                                            <span className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors truncate">
                                                                {dir.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1.5 flex-wrap">
                                                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${PRICING_COLORS[dir.pricing] || 'bg-gray-500/20 text-gray-400'}`}>
                                                                {dir.pricing}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className={`flex items-center gap-0.5 flex-shrink-0 ${daColor(dir.domain_authority)}`}>
                                                        <TrendingUp className="w-2.5 h-2.5" />
                                                        <span className="text-[10px] font-bold">{dir.domain_authority}</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                ))
                        )}
                    </div>
                </div>

                {/* ====== DRAG DIVIDER 1 ====== */}
                <div
                    className="hidden md:block w-1 flex-shrink-0 cursor-col-resize bg-white/5 hover:bg-fuchsia-500/60 active:bg-fuchsia-500 transition-colors group relative"
                    onMouseDown={(e) => onDividerMouseDown(0, e)}
                >
                    <div className="absolute inset-y-0 -left-1 -right-1" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-0.5 h-3 rounded-full bg-indigo-400" />
                        <div className="w-0.5 h-3 rounded-full bg-indigo-400" />
                    </div>
                </div>

                {/* ====== PANEL 2: Iframe Viewer ====== */}
                <div
                    className={`flex-col overflow-hidden border-r border-white/10 bg-gray-950 ${mobileActivePanel === 'preview' ? 'flex w-full' : 'hidden md:flex'}`}
                    style={isMobile ? {} : { width: `${panelWidths[1]}%` }}
                >
                    {selectedDir ? (
                        <>
                            {/* Iframe top bar */}
                            <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 bg-gray-900/80 border-b border-white/10">
                                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                    <Globe className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                                    <span className="text-xs font-semibold text-white truncate">{selectedDir.name}</span>
                                    <span className="text-[10px] text-white/30 truncate hidden sm:inline">{selectedDir.url}</span>
                                </div>
                                <a
                                    href={selectedDir.submission_url || selectedDir.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-semibold transition-all"
                                >
                                    <ExternalLink className="w-3 h-3" />
                                    Open
                                </a>
                                <button onClick={() => { setSelectedDir(null); }}
                                    className="flex-shrink-0 text-white/30 hover:text-white transition-colors p-1">
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Info strip */}
                            <div className="flex-shrink-0 flex items-center gap-3 px-3 py-1.5 bg-gray-900/40 border-b border-white/5 text-[10px] text-white/40">
                                <span>{CATEGORY_ICONS[selectedDir.category]} {selectedDir.category}</span>
                                <span className={daColor(selectedDir.domain_authority)}>DA {selectedDir.domain_authority}</span>
                                <span className={`px-1.5 py-0.5 rounded-full ${PRICING_COLORS[selectedDir.pricing] || ''}`}>{selectedDir.pricing}</span>
                                <span className="ml-auto truncate max-w-[200px] text-white/25">{selectedDir.description}</span>
                            </div>

                            {iframeBlocked ? (
                                <div className="flex-1 overflow-y-auto">
                                    {previewLoading ? (
                                        <div className="flex items-center justify-center h-40 gap-3">
                                            <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
                                            <span className="text-white/40 text-sm">Loading preview...</span>
                                        </div>
                                    ) : (
                                        <div className="p-6 space-y-5">
                                            {/* OG Image */}
                                            {sitePreview?.image && (
                                                <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5">
                                                    <img
                                                        src={sitePreview.image}
                                                        alt={sitePreview.title || selectedDir.name}
                                                        className="w-full object-cover max-h-52"
                                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                    />
                                                </div>
                                            )}

                                            {/* Site identity */}
                                            <div className="flex items-start gap-3">
                                                <img
                                                    src={sitePreview?.favicon || `https://www.google.com/s2/favicons?domain=${selectedDir.url}&sz=32`}
                                                    alt="favicon"
                                                    className="w-8 h-8 rounded-lg mt-0.5 bg-white/10"
                                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white font-bold text-base leading-tight mb-1">
                                                        {sitePreview?.title || selectedDir.name}
                                                    </h3>
                                                    <p className="text-indigo-400/80 text-xs truncate">{selectedDir.url}</p>
                                                </div>
                                            </div>

                                            {/* Description */}
                                            {(sitePreview?.description || selectedDir.description) && (
                                                <p className="text-white/60 text-sm leading-relaxed">
                                                    {sitePreview?.description || selectedDir.description}
                                                </p>
                                            )}

                                            {/* Directory detail chips */}
                                            <div className="flex flex-wrap gap-2">
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${PRICING_COLORS[selectedDir.pricing] || 'bg-gray-500/20 text-gray-400'}`}>
                                                    {selectedDir.pricing}
                                                </span>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-medium bg-white/5 border border-white/10 ${daColor(selectedDir.domain_authority)}`}>
                                                    DA {selectedDir.domain_authority}
                                                </span>
                                                <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-white/5 border border-white/10 text-white/50">
                                                    {CATEGORY_ICONS[selectedDir.category]} {selectedDir.category}
                                                </span>
                                            </div>

                                            {/* CTAs */}
                                            <div className="flex gap-3 pt-1">
                                                <a
                                                    href={selectedDir.submission_url || selectedDir.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 text-white text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                    Submit / Open
                                                </a>
                                                {selectedDir.submission_url && selectedDir.submission_url !== selectedDir.url && (
                                                    <a
                                                        href={selectedDir.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 text-sm font-semibold transition-all"
                                                    >
                                                        <Globe className="w-4 h-4" />
                                                        Visit
                                                    </a>
                                                )}
                                            </div>

                                            <p className="text-white/20 text-[10px] text-center">Preview via metadata — site blocks direct embedding</p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <iframe
                                    ref={iframeRef}
                                    key={selectedDir.id}
                                    src={selectedDir.url}
                                    title={selectedDir.name}
                                    className="flex-1 w-full border-0 bg-white"
                                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                                    onError={() => { setIframeBlocked(true); fetchSitePreview(selectedDir.url); }}
                                    onLoad={() => {
                                        try {
                                            const doc = iframeRef.current?.contentDocument;
                                            if (!doc || doc.body.innerHTML === '') {
                                                setIframeBlocked(true);
                                                fetchSitePreview(selectedDir.url);
                                            }
                                        } catch {
                                            setIframeBlocked(true);
                                            fetchSitePreview(selectedDir.url);
                                        }
                                    }}
                                />
                            )}
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 flex items-center justify-center border border-indigo-500/20">
                                    <ChevronLeft className="w-10 h-10 text-indigo-400/50" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center animate-pulse">
                                    <Globe className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-white/80 font-semibold text-lg mb-1">Directory Preview</h3>
                                <p className="text-white/30 text-sm">Click any directory from the left panel<br />to preview it here</p>
                            </div>
                            <div className="flex flex-col gap-2 w-full max-w-xs">
                                {[{ icon: '🚀', text: 'Browse 500+ directories' }, { icon: '👁️', text: 'Preview without leaving' }, { icon: '📋', text: 'Quick submit links' }].map(item => (
                                    <div key={item.text} className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/5 text-left">
                                        <span className="text-lg">{item.icon}</span>
                                        <span className="text-white/50 text-xs">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ====== DRAG DIVIDER 2 ====== */}
                <div
                    className="hidden md:block w-1 flex-shrink-0 cursor-col-resize bg-white/5 hover:bg-indigo-500/60 active:bg-indigo-500 transition-colors group relative"
                    onMouseDown={(e) => onDividerMouseDown(1, e)}
                >
                    <div className="absolute inset-y-0 -left-1 -right-1" />
                </div>

                {/* ====== PANEL 3: AI Studio ====== */}
                <div
                    className={`flex-col overflow-hidden bg-gray-900/60 ${mobileActivePanel === 'ai' ? 'flex w-full' : 'hidden md:flex'}`}
                    style={isMobile ? {} : { width: `${panelWidths[2]}%` }}
                >
                    {/* Panel header */}
                    <div className="flex-shrink-0 px-4 pt-3 pb-0 bg-gray-900/80 border-b border-white/10">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                                <Sparkles className="w-3.5 h-3.5 text-white" />
                            </div>
                            <h2 className="text-sm font-bold text-white">AI SaaS Studio</h2>
                        </div>
                        {/* Tabs */}
                        <div className="flex">
                            {[
                                { key: 'analyze', label: 'Analyze', icon: Zap },
                                { key: 'generate', label: 'Generate', icon: FileText },
                            ].map(tab => (
                                <button
                                    key={tab.key}
                                    onClick={() => setAiTab(tab.key as AITab)}
                                    className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border-b-2 transition-all ${aiTab === tab.key
                                        ? 'border-indigo-500 text-indigo-400'
                                        : 'border-transparent text-white/40 hover:text-white/70'
                                        }`}
                                >
                                    <tab.icon className="w-3.5 h-3.5" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab content */}
                    <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">

                        {/* ---- ANALYZE TAB ---- */}
                        {aiTab === 'analyze' && (
                            <div className="p-4 space-y-4">
                                <div>
                                    <p className="text-white/40 text-xs mb-4">Enter your SaaS details and get AI-powered marketing insights to guide your content generation.</p>

                                    {/* Inputs */}
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-[10px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">SaaS Name</label>
                                            <input
                                                type="text"
                                                value={saasName}
                                                onChange={e => setSaasName(e.target.value)}
                                                placeholder="e.g. Notion, Linear, Stripe..."
                                                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Website URL</label>
                                            <input
                                                type="url"
                                                value={saasUrl}
                                                onChange={e => setSaasUrl(e.target.value)}
                                                placeholder="https://yourapp.com"
                                                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">Description</label>
                                            <textarea
                                                value={saasDesc}
                                                onChange={e => setSaasDesc(e.target.value)}
                                                placeholder="What does your product do? Who is it for? What problem does it solve?"
                                                rows={4}
                                                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all resize-none"
                                            />
                                        </div>

                                        {analyzeError && (
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                                <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                                {analyzeError}
                                            </div>
                                        )}

                                        <button
                                            onClick={handleAnalyze}
                                            disabled={analyzing || (!saasName && !saasDesc)}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 hover:from-indigo-700 hover:to-blue-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                                        >
                                            {analyzing ? (
                                                <><RefreshCw className="w-4 h-4 animate-spin" /> Analyzing...</>
                                            ) : (
                                                <><Zap className="w-4 h-4" /> Analyze Website</>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Analysis results */}
                                {analysis && (
                                    <div className="space-y-3 pt-2 border-t border-white/10">
                                        {analysis.note && (
                                            <div className="px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-300 text-[10px]">
                                                ⚠️ {analysis.note}
                                            </div>
                                        )}

                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-1.5">Positioning</h4>
                                            <p className="text-white/70 text-xs leading-relaxed">{analysis.positioning}</p>
                                        </div>

                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1.5">Target Audience</h4>
                                            <p className="text-white/70 text-xs">{analysis.targetAudience}</p>
                                        </div>

                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="text-[10px] font-bold text-green-400 uppercase tracking-wider mb-2">Unique Selling Points</h4>
                                            <ul className="space-y-1">
                                                {analysis.usp?.map((u, i) => (
                                                    <li key={i} className="flex items-start gap-2 text-xs text-white/60">
                                                        <span className="text-green-400 mt-0.5">✓</span> {u}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="text-[10px] font-bold text-orange-400 uppercase tracking-wider mb-2">Keywords</h4>
                                            <div className="flex flex-wrap gap-1">
                                                {analysis.keywords?.map(k => (
                                                    <span key={k} className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-300 text-[10px]">{k}</span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                                            <h4 className="text-[10px] font-bold text-pink-400 uppercase tracking-wider mb-2">Content Angles</h4>
                                            <ul className="space-y-1">
                                                {analysis.contentAngles?.map((a, i) => (
                                                    <li key={i} className="text-xs text-white/60 flex items-start gap-2">
                                                        <span className="text-pink-400 font-bold">{i + 1}.</span> {a}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>

                                        <button
                                            onClick={() => setAiTab('generate')}
                                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 text-sm font-semibold transition-all"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Generate Content →
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ---- GENERATE TAB ---- */}
                        {aiTab === 'generate' && (
                            <div className="p-4 space-y-4">
                                {!analysis && !saasName && (
                                    <div className="px-3 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs">
                                        💡 Fill in the <button onClick={() => setAiTab('analyze')} className="underline font-semibold">Analyze tab</button> first for best results — or generate directly below.
                                    </div>
                                )}

                                {/* Quick context if no analysis */}
                                {!analysis && (
                                    <div className="space-y-2">
                                        <label className="block text-[10px] font-semibold text-white/50 uppercase tracking-wider">Quick Product Context</label>
                                        <input
                                            type="text"
                                            value={saasName}
                                            onChange={e => setSaasName(e.target.value)}
                                            placeholder="Product name..."
                                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 transition-all"
                                        />
                                        <textarea
                                            value={saasDesc}
                                            onChange={e => setSaasDesc(e.target.value)}
                                            placeholder="What does it do? Who is it for?"
                                            rows={2}
                                            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-indigo-500/60 transition-all resize-none"
                                        />
                                    </div>
                                )}

                                {/* Analysis summary badge */}
                                {analysis && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
                                        <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] text-green-300 font-semibold">{saasName || 'Product'} analyzed</p>
                                            <p className="text-[10px] text-white/40 truncate">{analysis.targetAudience}</p>
                                        </div>
                                        <button onClick={() => setAiTab('analyze')} className="text-[10px] text-fuchsia-400 hover:text-fuchsia-300">edit</button>
                                    </div>
                                )}

                                {/* Mode buttons */}
                                <div>
                                    <label className="block text-[10px] font-semibold text-white/50 mb-2 uppercase tracking-wider">Content Type</label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {[
                                            { mode: 'comment' as GenerateMode, icon: MessageSquare, label: 'Comment', desc: 'Community reply', color: 'from-blue-500 to-cyan-500' },
                                            { mode: 'post' as GenerateMode, icon: Zap, label: 'Social Post', desc: 'Twitter / LinkedIn', color: 'from-violet-500 to-purple-500' },
                                            { mode: 'story' as GenerateMode, icon: BookOpen, label: 'Story', desc: 'Founder narrative', color: 'from-pink-500 to-rose-500' },
                                            { mode: 'content' as GenerateMode, icon: FileText, label: 'Content', desc: 'Blog / article intro', color: 'from-orange-500 to-amber-500' },
                                        ].map(({ mode, icon: Icon, label, desc, color }) => (
                                            <button
                                                key={mode}
                                                onClick={() => handleGenerate(mode)}
                                                disabled={generating || (!saasName && !saasDesc && !analysis)}
                                                className={`flex flex-col items-start gap-1 p-3 rounded-xl border transition-all disabled:opacity-40 disabled:cursor-not-allowed ${generateMode === mode && generated
                                                    ? `bg-gradient-to-br ${color} bg-opacity-20 border-white/20`
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/15'
                                                    }`}
                                            >
                                                <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}>
                                                    <Icon className="w-3.5 h-3.5 text-white" />
                                                </div>
                                                <span className="text-xs font-semibold text-white">{label}</span>
                                                <span className="text-[10px] text-white/40">{desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Generating spinner */}
                                {generating && (
                                    <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-fuchsia-500/10 border border-fuchsia-500/20">
                                        <RefreshCw className="w-4 h-4 text-fuchsia-400 animate-spin" />
                                        <span className="text-violet-300 text-xs">Generating {generateMode}...</span>
                                    </div>
                                )}

                                {/* Error */}
                                {generateError && (
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                        {generateError}
                                    </div>
                                )}

                                {/* Generated output */}
                                {generated && !generating && (
                                    <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
                                            <span className="text-[10px] font-semibold text-white/50 uppercase tracking-wider">Generated {generateMode}</span>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleGenerate(generateMode)}
                                                    className="text-[10px] text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors"
                                                >
                                                    <RefreshCw className="w-3 h-3" /> Regenerate
                                                </button>
                                                <button
                                                    onClick={handleCopy}
                                                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/60 hover:text-white hover:bg-white/15'}`}
                                                >
                                                    {copied ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                                                </button>
                                            </div>
                                        </div>
                                        <div className="p-4">
                                            <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">{generated}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden flex-shrink-0 flex items-center justify-around bg-gray-900 border-t border-white/10 p-2 z-50">
                <button
                    onClick={() => setMobileActivePanel('list')}
                    className={`flex flex-col items-center gap-1 p-2 flex-1 ${mobileActivePanel === 'list' ? 'text-indigo-400' : 'text-white/40'}`}
                >
                    <Search className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Directories</span>
                </button>
                <button
                    onClick={() => setMobileActivePanel('preview')}
                    className={`flex flex-col items-center gap-1 p-2 flex-1 ${mobileActivePanel === 'preview' ? 'text-indigo-400' : 'text-white/40'}`}
                >
                    <Globe className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">Preview</span>
                </button>
                <button
                    onClick={() => setMobileActivePanel('ai')}
                    className={`flex flex-col items-center gap-1 p-2 flex-1 ${mobileActivePanel === 'ai' ? 'text-indigo-400' : 'text-white/40'}`}
                >
                    <Sparkles className="w-5 h-5" />
                    <span className="text-[10px] font-semibold">AI Studio</span>
                </button>
            </div>

            <PageGuide
                title="Distribution Workspace"
                steps={[
                    { title: 'Directories Panel', description: 'Browse or search through hundreds of startup directories. Click any directory to open it in the center panel.' },
                    { title: 'Center Preview', description: 'Interact with the directory website directly in this workspace without opening a new tab. Some websites block this, in which case we show a quick preview.' },
                    { title: 'AI Studio', description: 'Enter your SaaS details to get actionable insights, then seamlessly generate copy tailored to the platform you are distributing on.' },
                    { title: 'Resize Panels', description: 'You can drag the dividers between the panels to customize your workspace layout.' },
                ]}
            />
        </div>
    );
}
