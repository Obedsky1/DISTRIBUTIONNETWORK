'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, ExternalLink, Users, Loader2, Plus, Check, Filter, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { setDocument, queryDocuments } from '@/lib/firebase/firestore';
import { DirectorySubmission } from '@/types/distribution';
import { PageGuide } from '@/components/PageGuide';

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
type Item = ({ kind: 'community' } & Community) | ({ kind: 'directory' } & Directory);

/* ─── Helpers ─── */
function shuffle<T>(arr: T[]): T[] {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : String(n);

const PLATFORM_COLOR: Record<string, string> = {
    Reddit: 'from-orange-500 to-red-600',
    Discord: 'from-indigo-500 to-indigo-700',
    Telegram: 'from-sky-400 to-blue-600',
    Facebook: 'from-blue-600 to-blue-800',
};
const pColor = (p: string) => PLATFORM_COLOR[p] ?? 'from-gray-600 to-gray-700';
const PLATFORM_EMOJI: Record<string, string> = { Reddit: '🔴', Discord: '🟣', Telegram: '✈️', Facebook: '🔷' };

const PRICING_STYLE: Record<string, string> = {
    Free: 'bg-green-500/15 text-green-300',
    Paid: 'bg-emerald-500/15 text-emerald-300',
    'Free/Paid': 'bg-blue-500/15 text-blue-300',
    'Revenue Share': 'bg-orange-500/15 text-orange-300',
};
const DA_COLOR = (da: number) => da >= 80 ? 'text-green-400' : da >= 60 ? 'text-blue-400' : da >= 40 ? 'text-yellow-400' : 'text-gray-500';

/* ─── Channel Types ─── */
const CHANNEL_TABS = [
    { id: 'all', label: 'All Channels', icon: '⚡' },
    { id: 'community', label: 'Communities', icon: '👥' },
    { id: 'directory', label: 'Directories', icon: '📁' },
];

/* ─── Community Card ─── */
function CommunityCard({ c, isAdded, onAdd }: { c: Community; isAdded: boolean; onAdd: () => void }) {
    return (
        <div className="glass-strong rounded-2xl p-5 hover:scale-[1.015] transition-all duration-200 group flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${pColor(c.platform)} text-white`}>
                    {PLATFORM_EMOJI[c.platform] ?? '💬'} {c.platform}
                </span>
                <div className="flex items-center gap-1 text-white/40 text-xs">
                    <Users className="w-3 h-3" />
                    {fmt(c.member_count)}
                </div>
            </div>
            <div>
                <h3 className="font-bold text-sm group-hover:text-emerald-400 transition-colors mb-0.5">{c.name}</h3>
                <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">{c.description}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
                {c.categories.filter(Boolean).slice(0, 3).map(cat => (
                    <span key={cat} className="px-2 py-0.5 rounded-lg bg-white/6 text-[9px] text-white/50">{cat}</span>
                ))}
            </div>
            <div className="flex gap-2 mt-auto">
                <button onClick={onAdd} disabled={isAdded}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                        ${isAdded ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/8 hover:bg-emerald-500 border border-white/10 text-white'}`}>
                    {isAdded ? <><Check className="w-3 h-3" />Saved</> : <><Plus className="w-3 h-3" />Pipeline</>}
                </button>
                <a href={c.invite_link || c.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    );
}

/* ─── Directory Card ─── */
function DirectoryCard({ d, isAdded, onAdd }: { d: Directory; isAdded: boolean; onAdd: () => void }) {
    return (
        <div className="glass-strong rounded-2xl p-5 hover:scale-[1.015] transition-all duration-200 group flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-yellow-500/12 text-yellow-300 border border-yellow-500/20">
                    📁 Directory
                </span>
                <span className={`text-xs font-bold ${DA_COLOR(d.domain_authority ?? 0)}`}>DA {d.domain_authority ?? '–'}</span>
            </div>
            <div>
                <h3 className="font-bold text-sm group-hover:text-yellow-400 transition-colors mb-0.5">{d.name}</h3>
                <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">{d.description}</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
                <span className="px-2 py-0.5 rounded-lg bg-white/6 text-[9px] text-white/50">{d.category}</span>
                {d.pricing && (
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] ${PRICING_STYLE[d.pricing] ?? 'bg-gray-500/15 text-gray-400'}`}>{d.pricing}</span>
                )}
            </div>
            <div className="flex gap-2 mt-auto">
                <button onClick={onAdd} disabled={isAdded}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all
                        ${isAdded ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'bg-white/8 hover:bg-yellow-500 border border-white/10 text-white'}`}>
                    {isAdded ? <><Check className="w-3 h-3" />Saved</> : <><Plus className="w-3 h-3" />Pipeline</>}
                </button>
                <a href={d.submission_url || d.url} target="_blank" rel="noopener noreferrer"
                    className="flex items-center justify-center px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/50 hover:text-white transition-all">
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            </div>
        </div>
    );
}

/* ═══════════════════════ PAGE ═══════════════════════ */
export default function DiscoverPage() {
    const { user, openAuthModal } = useAuthStore();
    const userId = user?.id || 'anonymous';
    const projectId = `default_project_${userId}`;

    const [searchQuery, setSearchQuery] = useState('');
    const [communities, setCommunities] = useState<Community[]>([]);
    const [directories, setDirectories] = useState<Directory[]>([]);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, platforms: 0 });
    const [activeTab, setActiveTab] = useState<'all' | 'community' | 'directory'>('all');
    const [seed] = useState(() => Math.random());

    useEffect(() => {
        Promise.all([
            fetch('/api/communities?limit=1000&sortBy=member_count&sortOrder=desc').then(r => r.json()),
            fetch('/api/directories?limit=1000').then(r => r.json()),
            fetch('/api/stats').then(r => r.json()),
        ]).then(([commData, dirData, statData]) => {
            // Only real social communities (no directories)
            const comms = (commData.communities || []).filter(
                (c: Community) => c.platform !== 'Directory' && !(c as any).is_directory
            );
            setCommunities(comms);
            setDirectories(dirData.directories || []);
            setStats({ total: statData.total_communities || 0, platforms: Object.keys(statData.platforms || {}).length });
        }).catch(console.error).finally(() => setLoading(false));

        if (user) {
            Promise.all([
                queryDocuments<DirectorySubmission>('directory_submissions', [{ field: 'project_id', operator: '==', value: projectId }]),
                queryDocuments<DirectorySubmission>('community_submissions', [{ field: 'project_id', operator: '==', value: projectId }]),
            ]).then(([dirSubs, commSubs]) => {
                const ids = new Set([...(dirSubs || []).map(s => s.directory_id), ...(commSubs || []).map(s => s.directory_id)]);
                setAddedIds(ids);
            });
        }
    }, [user, projectId]);

    const handleAdd = async (item: Item) => {
        if (!user) { openAuthModal(); return; }
        const collection = item.kind === 'directory' ? 'directory_submissions' : 'community_submissions';
        const subId = `${item.kind}_sub_${Date.now()}`;
        const newSub: DirectorySubmission = {
            id: subId, project_id: projectId, directory_id: item.id,
            directory_name: item.name, directory_url: item.url || '',
            status: 'not_started', created_at: new Date(), updated_at: new Date()
        };
        try {
            await setDocument(collection, subId, newSub);
            setAddedIds(prev => new Set([...Array.from(prev), item.id]));
        } catch (err) { console.error(err); }
    };

    /* Mixed shuffled feed */
    const mixedFeed = useMemo((): Item[] => {
        const comms = communities.map(c => ({ kind: 'community' as const, ...c }));
        const dirs = directories.map(d => ({ kind: 'directory' as const, ...d }));
        return shuffle([...comms, ...dirs]);
    }, [communities, directories, seed]);

    /* Tab filter */
    const tabFiltered = useMemo((): Item[] => {
        if (activeTab === 'community') return communities.map(c => ({ kind: 'community' as const, ...c }));
        if (activeTab === 'directory') return directories.map(d => ({ kind: 'directory' as const, ...d }));
        return mixedFeed;
    }, [mixedFeed, communities, directories, activeTab]);

    /* Search */
    const filtered = useMemo((): Item[] => {
        if (!searchQuery.trim()) return tabFiltered;
        const q = searchQuery.toLowerCase();
        return tabFiltered.filter(item =>
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            (item.kind === 'community'
                ? item.categories.some(c => c?.toLowerCase().includes(q)) || item.platform.toLowerCase().includes(q)
                : item.category?.toLowerCase().includes(q))
        );
    }, [tabFiltered, searchQuery]);

    const totalChannels = communities.length + directories.length;

    return (
        <div className="min-h-screen bg-[#0a0a0f] Discover_grid_container">

            {/* Header */}
            {/* Header - Optimized for mobile by relying on global sidebar header */}
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-2xl">⚡</span>
                            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                                Discovery <span className="text-emerald-400">Channels</span>
                            </h1>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2">
                            <p className="text-xs text-white/45">
                                {totalChannels.toLocaleString()} channels
                            </p>
                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                            <p className="text-xs text-emerald-400/70 font-bold">
                                {communities.length} communities
                            </p>
                            <div className="w-1 h-1 bg-white/20 rounded-full" />
                            <p className="text-xs text-yellow-400/70 font-bold">
                                {directories.length} directories
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-2 flex-wrap items-center">
                        <a href="/dashboard/communities"
                            className="glass px-4 py-2 rounded-xl hover:glass-strong transition-all flex items-center gap-2 text-sm font-semibold border border-white/5">
                            📡 <span>Communities</span>
                        </a>
                        <a href="/dashboard/directories"
                            className="glass px-4 py-2 rounded-xl hover:glass-strong transition-all flex items-center gap-2 text-sm font-semibold border border-yellow-500/20">
                            📁 <span>Directories</span>
                        </a>
                    </div>
                </div>

                {/* Search */}
                <div className="mt-6 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder={`Search ${totalChannels}+ communities, directories, platforms…`}
                        className="w-full pl-12 pr-4 py-3.5 glass rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 bg-white/5 text-sm transition-all" />
                </div>

                <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                    {CHANNEL_TABS.map(tab => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap ${activeTab === tab.id
                                ? 'bg-white/10 border-white/20 text-white shadow-lg'
                                : 'border-white/5 text-white/40 hover:text-white hover:border-white/10 hover:bg-white/5'
                                }`}>
                            <span>{tab.icon}</span>
                            {tab.label}
                            <span className="text-[10px] opacity-40 ml-1 font-medium">
                                ({tab.id === 'all' ? totalChannels : tab.id === 'community' ? communities.length : directories.length})
                            </span>
                        </button>
                    ))}
                </div>

                {/* Quick-access links */}
                <div className="mt-4 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                    <a href="/campaign"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:scale-[1.02] transition-all text-white font-bold text-xs shadow-lg shadow-indigo-600/20 whitespace-nowrap">
                        🎯 Campaigns
                    </a>
                    <a href="/dashboard/communities"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-emerald-400 font-bold text-xs whitespace-nowrap">
                        📡 Community Workspace
                    </a>
                    <a href="/workspace"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-white/60 font-bold text-xs whitespace-nowrap">
                        📋 Distribution Workspace
                    </a>
                </div>
            </div>


            {/* Main grid */}
            {loading ? (
                <div className="flex items-center justify-center py-24 gap-3">
                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
                    <span className="text-white/40">Loading {totalChannels > 0 ? totalChannels : '…'} channels</span>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto px-4 pb-12 Discover_grid_container">
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Filter className="w-4 h-4 text-white/30" />
                            <span className="text-sm text-white/40">
                                {filtered.length} {activeTab === 'all' ? 'channels' : activeTab === 'community' ? 'communities' : 'directories'}
                                {searchQuery ? ` matching "${searchQuery}"` : ' ' + (activeTab === 'all' ? '— randomly mixed' : '')}
                            </span>
                        </div>
                        {activeTab === 'community' && (
                            <a href="/dashboard/communities" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors">
                                <BookOpen className="w-3 h-3" /> Full Community Workspace →
                            </a>
                        )}
                    </div>

                    {filtered.length === 0 ? (
                        <div className="text-center py-16 glass-strong rounded-2xl">
                            <p className="text-white/40 text-sm">No results found. Try a different search term.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {filtered.map(item =>
                                item.kind === 'community'
                                    ? <CommunityCard key={`c-${item.id}`} c={item} isAdded={addedIds.has(item.id)} onAdd={() => handleAdd(item)} />
                                    : <DirectoryCard key={`d-${item.id}`} d={item} isAdded={addedIds.has(item.id)} onAdd={() => handleAdd(item)} />
                            )}
                        </div>
                    )}
                </div>
            )}

            <PageGuide
                title="Discovery Hub"
                steps={[
                    { title: 'Find Channels', description: 'Browse and search through hundreds of communities and directories tailored for startup distribution.' },
                    { title: 'Filter the Feed', description: 'Use the tabs above to filter between communities (Reddit, Discord, Facebook) and directories (Software review sites, startup lists).' },
                    { title: 'Save to Pipeline', description: 'Click Pipeline to add a channel to your tracker. This will show up in your Distro Pipeline and workspaces' },
                    { title: 'Go to Workspaces', description: 'Once you have saved enough channels, use the shortcuts at the top to visit your Distribution Workspace' },
                ]}
            />
        </div>
    );
}
