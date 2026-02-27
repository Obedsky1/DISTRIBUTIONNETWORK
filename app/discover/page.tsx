'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, ExternalLink, Users, Loader2, Shuffle, Sparkles, Filter } from 'lucide-react';
import PipelineRandomizerModal from '@/components/PipelineRandomizerModal';

/* ─── Types ─── */
interface Community {
    id: string; name: string; platform: string; description: string;
    url: string; invite_link?: string; member_count: number;
    categories: string[]; use_cases?: string[];
}
interface Directory {
    id: string; name: string; category: string; description: string;
    url: string; submission_url?: string; pricing?: string; domain_authority?: number;
}
type MixedItem = ({ kind: 'community' } & Community) | ({ kind: 'directory' } & Directory);

/* ─── Helpers ─── */
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const formatCount = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);

const PLATFORM_COLOR: Record<string, string> = {
    Reddit: 'from-orange-500 to-red-600',
    Discord: 'from-indigo-500 to-indigo-700',
    Telegram: 'from-blue-400 to-blue-600',
    Facebook: 'from-blue-600 to-blue-800',
    Directory: 'from-emerald-500 to-teal-600',
};
const platformColor = (p: string) => PLATFORM_COLOR[p] ?? 'from-gray-500 to-gray-700';

const PRICING_STYLE: Record<string, string> = {
    Free: 'bg-green-500/15 text-green-300',
    Paid: 'bg-emerald-500/15 text-emerald-300',
    'Free/Paid': 'bg-blue-500/15 text-blue-300',
    'Revenue Share': 'bg-orange-500/15 text-orange-300',
};
const DA_COLOR = (da: number) =>
    da >= 80 ? 'text-green-400' : da >= 60 ? 'text-blue-400' : da >= 40 ? 'text-yellow-400' : 'text-gray-500';

/* ─── Community Card ─── */
function CommunityCard({ c }: { c: Community }) {
    return (
        <div className="glass-strong rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 group flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${platformColor(c.platform)} text-white`}>{c.platform}</span>
                <div className="flex items-center gap-1 text-white/50 text-xs">
                    <Users className="w-3.5 h-3.5" />{formatCount(c.member_count)}
                </div>
            </div>
            <div>
                <h3 className="font-bold text-sm group-hover:text-emerald-400 transition-colors mb-1">{c.name}</h3>
                <p className="text-[12px] text-white/55 line-clamp-2 leading-relaxed">{c.description}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {c.categories.slice(0, 3).map(cat => (
                    <span key={cat} className="px-2 py-0.5 rounded-lg bg-white/8 text-[10px] text-white/60">{cat}</span>
                ))}
            </div>
            {c.use_cases && c.use_cases.length > 0 && (
                <div className="flex flex-wrap gap-1">
                    {c.use_cases.slice(0, 2).map(u => (
                        <span key={u} className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">{u}</span>
                    ))}
                </div>
            )}
            <a href={c.invite_link || c.url} target="_blank" rel="noopener noreferrer"
                className="mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-600 hover:to-gray-800 text-white font-medium text-xs transition-all">
                Join Community <ExternalLink className="w-3.5 h-3.5" />
            </a>
        </div>
    );
}

/* ─── Directory Card ─── */
function DirectoryCard({ d }: { d: Directory }) {
    return (
        <div className="glass-strong rounded-2xl p-5 hover:scale-[1.02] transition-all duration-300 group flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-yellow-500/12 text-yellow-300 border border-yellow-500/20">📁 Directory</span>
                <span className={`text-xs font-bold ${DA_COLOR(d.domain_authority ?? 0)}`}>DA {d.domain_authority ?? '–'}</span>
            </div>
            <div>
                <h3 className="font-bold text-sm group-hover:text-yellow-400 transition-colors mb-1">{d.name}</h3>
                <p className="text-[12px] text-white/55 line-clamp-2 leading-relaxed">{d.description}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-lg bg-white/8 text-[10px] text-white/60">{d.category}</span>
                {d.pricing && (
                    <span className={`px-2 py-0.5 rounded-lg text-[10px] ${PRICING_STYLE[d.pricing] ?? 'bg-gray-500/15 text-gray-400'}`}>{d.pricing}</span>
                )}
            </div>
            <a href={d.submission_url || d.url} target="_blank" rel="noopener noreferrer"
                className="mt-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-medium text-xs transition-all">
                Submit / Visit <ExternalLink className="w-3.5 h-3.5" />
            </a>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════ */

export default function DiscoverPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [communities, setCommunities] = useState<Community[]>([]);
    const [directories, setDirectories] = useState<Directory[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, platforms: 0 });
    const [seed] = useState(() => Math.random()); // fresh random every visit

    // AI Randomizer State
    const [randomizerOpen, setRandomizerOpen] = useState(false);

    const platforms = [
        { id: 'Reddit', name: 'Reddit', icon: '🔴' },
        { id: 'Discord', name: 'Discord', icon: '💬' },
        { id: 'Telegram', name: 'Telegram', icon: '✈️' },
        { id: 'Facebook', name: 'Facebook', icon: '📘' },
        { id: 'Directory', name: 'Directories', icon: '📁' },
        { id: 'Other', name: 'Other', icon: '🌐' },
    ];

    /* Mixed random feed — reshuffled on every page load via seed */
    const mixedFeed = useMemo((): MixedItem[] => {
        const comms = communities.map(c => ({ kind: 'community' as const, ...c }));
        const dirs = directories.map(d => ({ kind: 'directory' as const, ...d }));
        return shuffle([...comms, ...dirs]);
    }, [communities, directories, seed]);

    useEffect(() => {
        Promise.all([
            fetch('/api/communities?limit=50&sortBy=member_count&sortOrder=desc').then(r => r.json()),
            fetch('/api/directories?limit=200').then(r => r.json()),
            fetch('/api/stats').then(r => r.json()),
        ]).then(([commData, dirData, statData]) => {
            setCommunities(commData.communities || []);
            setDirectories(dirData.directories || []);
            setStats({ total: statData.total_communities || 0, platforms: Object.keys(statData.platforms || {}).length });
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    /* Filtered feed */
    const filteredFeed = useMemo(() => {
        const q = searchQuery.toLowerCase();
        return mixedFeed.filter(item => {
            if (q && !item.name.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) return false;
            if (selectedPlatforms.length > 0) {
                if (item.kind === 'directory') return selectedPlatforms.includes('Directory');
                return selectedPlatforms.includes(item.platform);
            }
            return true;
        });
    }, [mixedFeed, searchQuery, selectedPlatforms]);

    const togglePlatform = (id: string) =>
        setSelectedPlatforms(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black">

            {/* Header */}
            <header className="sticky top-0 z-50 glass-dark backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-lg">⚡</span>
                                <h1 className="text-xl sm:text-2xl font-black tracking-tight">Distribute <span className="text-emerald-400">Everywhere</span></h1>
                            </div>
                            <p className="text-xs sm:text-sm text-white/50">500+ channels · {stats.total} communities · directories · beta platforms</p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <a href="/dashboard/communities"
                                className="glass px-4 py-2 rounded-xl hover:glass-strong transition-all text-sm flex items-center gap-2">
                                <span>👥</span>
                                <span className="hidden sm:inline">Communities</span>
                            </a>
                            <a href="/dashboard/directories"
                                className="glass px-4 py-2 rounded-xl hover:glass-strong transition-all text-sm flex items-center gap-2 border border-yellow-500/30">
                                <span>👑</span>
                                <span className="hidden sm:inline">500+ Directories</span>
                                <span className="sm:hidden">Directories</span>
                            </a>
                            <a href="/" className="glass px-3 py-2 rounded-xl hover:glass-strong transition-all text-sm">← Home</a>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="mt-3 sm:mt-4 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Search 500+ distribution channels, communities, directories…"
                            className="w-full pl-10 pr-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white/5 text-sm" />
                    </div>

                    {/* Platform Filters */}
                    <div className="flex gap-2 mt-3 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0">
                        {platforms.map(p => (
                            <button key={p.id} onClick={() => togglePlatform(p.id)}
                                className={`px-3 sm:px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all text-sm flex items-center gap-1.5 ${selectedPlatforms.includes(p.id) ? 'bg-gradient-to-r from-gray-700 to-gray-900' : 'glass hover:glass-strong'}`}>
                                <span>{p.icon}</span>{p.name}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {loading ? (
                <div className="text-center py-24">
                    <div className="inline-flex items-center gap-3 glass-strong px-6 py-4 rounded-2xl">
                        <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                        <span className="text-gray-300">Loading…</span>
                    </div>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-6 pb-10 space-y-8">

                    {/* Hero cards */}
                    <div className="grid sm:grid-cols-2 gap-4">

                        {/* Distribution Channels → Communities */}
                        <a href="/dashboard/communities"
                            className="glass-strong rounded-2xl p-6 border border-emerald-500/25 flex flex-col gap-4 hover:scale-[1.01] transition-all duration-300 group">
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-2xl">📡</div>
                                <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-xs font-semibold text-emerald-300">⚡ Smart Match</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1 group-hover:text-emerald-400 transition-colors">Distribution Channels</h3>
                                <p className="text-sm text-white/60">Reddit, Discord, Telegram & Facebook communities — matched to your goal in 3 questions</p>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm mt-auto">
                                Find My Channels <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </a>

                        {/* Launch Directories */}
                        <a href="/dashboard/directories"
                            className="glass-strong rounded-2xl p-6 hover:scale-[1.01] transition-all duration-300 group border border-yellow-500/20 flex flex-col gap-4">
                            <div className="flex items-start justify-between">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-2xl">🚀</div>
                                <span className="px-3 py-1 rounded-full bg-yellow-500/15 border border-yellow-500/25 text-xs font-semibold text-yellow-300">500+ Platforms</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-1 group-hover:text-yellow-400 transition-colors">Launch Directories</h3>
                                <p className="text-sm text-white/60">Submit to Product Hunt, SEO directories, AI directories, and 500+ launch platforms to get discovered</p>
                            </div>
                            <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm mt-auto">
                                Start Submitting <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </a>
                    </div>

                    {/* Mixed random feed */}
                    <div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent hidden sm:block" />
                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    onClick={() => setRandomizerOpen(true)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:scale-105 hover:shadow-lg hover:shadow-indigo-600/25 transition-all text-white font-bold text-sm"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    AI Recommendation Randomizer
                                </button>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent hidden sm:block" />
                        </div>

                        <div className="flex items-center gap-2 text-white/40 text-sm mb-4">
                            <Filter className="w-4 h-4" />
                            <span>All Channels — Filtered & Sorted below</span>
                        </div>

                        {filteredFeed.length === 0 ? (
                            <div className="text-center py-12 glass-strong rounded-2xl">
                                <h3 className="text-lg font-semibold mb-2">Nothing found</h3>
                                <p className="text-white/40 text-sm">Try adjusting your search or filters</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {filteredFeed.map(item =>
                                    item.kind === 'community'
                                        ? <CommunityCard key={`c-${item.id}`} c={item} />
                                        : <DirectoryCard key={`d-${item.id}`} d={item} />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <PipelineRandomizerModal
                isOpen={randomizerOpen}
                onClose={() => setRandomizerOpen(false)}
                mixedFeed={mixedFeed}
            />
        </main>
    );
}
