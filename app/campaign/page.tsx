'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Rocket, Search, Users, Brain, MessageSquare, Newspaper,
    Lock, ArrowRight, TrendingUp, Mail, Share2, CheckCircle2,
    X, Plus, ChevronRight, Clock, Zap, ExternalLink
} from 'lucide-react';
import communitiesData from '@/data/communities.json';
import { PageGuide } from '@/components/PageGuide';

// ── Campaign type definitions ─────────────────────────────────────────────────
const CAMPAIGN_TYPES = [
    {
        id: 'seo',
        title: 'SEO Campaign',
        description: 'Boost organic traffic through high-quality backlink placements and directory submissions.',
        icon: Search,
        color: 'from-blue-500 to-cyan-500',
        bgColor: 'bg-blue-500/10',
        borderColor: 'border-blue-500/20',
        premiumOnly: false,
        communityKeywords: ['SEO', 'Marketing', 'Growth', 'SaaS Founders', 'Startups', 'Product Distribute'],
    },
    {
        id: 'betatesters',
        title: 'Betatester Campaign',
        description: 'Get your first active users from communities of early adopters and beta testers.',
        icon: Users,
        color: 'from-orange-500 to-red-500',
        bgColor: 'bg-orange-500/10',
        borderColor: 'border-orange-500/20',
        premiumOnly: false,
        communityKeywords: ['Product Distribute', 'Indie Hackers', 'Side Projects', 'Makers', 'Early Stage', 'SaaS Founders'],
    },
    {
        id: 'community',
        title: 'Community Engagement',
        description: 'Targeted promotion in niche subreddits, Discord servers, and Telegram groups.',
        icon: MessageSquare,
        color: 'from-emerald-500 to-teal-500',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'border-emerald-500/20',
        premiumOnly: true,
        communityKeywords: ['Entrepreneurship', 'Networking', 'Collaboration', 'Startups', 'Founders'],
    },
    {
        id: 'aiseo',
        title: 'AI SEO Campaign',
        description: 'Optimize your presence for AI search engines like ChatGPT, Perplexity, and Claude.',
        icon: Brain,
        color: 'from-purple-500 to-indigo-500',
        bgColor: 'bg-purple-500/10',
        borderColor: 'border-purple-500/20',
        premiumOnly: true,
        communityKeywords: ['Marketing', 'Growth', 'SaaS Founders', 'Technology'],
    },
    {
        id: 'pr',
        title: 'PR & News Distribution',
        description: 'Get featured on relevant startup news sites, newsletters, and tech blogs.',
        icon: Newspaper,
        color: 'from-pink-500 to-rose-500',
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/20',
        premiumOnly: true,
        communityKeywords: ['Startups', 'Product Distribute', 'Build in Public', 'Indie Hackers'],
    },
    {
        id: 'launch',
        title: 'Product Distribute',
        description: 'Comprehensive distribute strategy for Product Hunt, Hacker News, and major platforms.',
        icon: Rocket,
        color: 'from-yellow-400 to-orange-500',
        bgColor: 'bg-yellow-500/10',
        borderColor: 'border-yellow-500/20',
        premiumOnly: true,
        communityKeywords: ['Product Distribute', 'Indie Hackers', 'SaaS Founders', 'Makers', 'Side Projects'],
    },
    {
        id: 'reddit_growth',
        title: 'Reddit Growth',
        description: 'Authentic engagement and posting strategies for targeted subreddits.',
        icon: TrendingUp,
        color: 'from-orange-500 to-amber-500',
        bgColor: 'bg-amber-500/10',
        borderColor: 'border-amber-500/20',
        premiumOnly: true,
        communityKeywords: ['Entrepreneurship', 'SaaS Founders', 'Marketing', 'Growth', 'Bootstrap'],
    },
    {
        id: 'newsletter_outreach',
        title: 'Newsletter Outreach',
        description: 'Get featured in prominent indie hacker and SaaS newsletters.',
        icon: Mail,
        color: 'from-blue-400 to-indigo-500',
        bgColor: 'bg-indigo-500/10',
        borderColor: 'border-indigo-500/20',
        premiumOnly: true,
        communityKeywords: ['Marketing', 'Indie Hackers', 'SaaS Founders', 'Newsletter'],
    },
    {
        id: 'social_media_blitz',
        title: 'Social Media Blitz',
        description: 'Coordinated cross-platform content strategy for Twitter, LinkedIn, and more.',
        icon: Share2,
        color: 'from-pink-500 to-purple-500',
        bgColor: 'bg-pink-500/10',
        borderColor: 'border-pink-500/20',
        premiumOnly: true,
        communityKeywords: ['Marketing', 'Growth Hacking', 'Social Media', 'Build in Public'],
    },
];

// ── Smart pre-fill: pick communities matching campaign type ───────────────────
function getSuggestedTargets(campaignId: string) {
    const type = CAMPAIGN_TYPES.find(c => c.id === campaignId);
    if (!type) return [];

    const allCommunities: any[] = (communitiesData as any).communities || [];
    const matched = allCommunities.filter(c =>
        c.categories?.some((cat: string) =>
            type.communityKeywords.some(kw =>
                cat.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(cat.toLowerCase())
            )
        )
    );

    // Return top 15 sorted by member count desc
    return matched
        .sort((a, b) => (b.member_count || 0) - (a.member_count || 0))
        .slice(0, 15)
        .map(c => ({
            id: c.id,
            name: c.name,
            url: c.url || c.invite_link || '',
            kind: 'community' as const,
            category: c.categories?.[0] || '',
            platform: c.platform,
            memberCount: c.member_count,
        }));
}

interface Campaign {
    id: string;
    name: string;
    type: string;
    status: string;
    targets: any[];
    currentBatchIndex: number;
    createdAt: any;
}

export default function CampaignPage() {
    const router = useRouter();
    const { user, openAuthModal } = useAuthStore();
    const isPremium = user?.isPremium;
    const pipelineItems = user?.distroPipeline || [];

    // Existing campaigns
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loadingCampaigns, setLoadingCampaigns] = useState(true);

    // Modal state
    const [selectedType, setSelectedType] = useState<typeof CAMPAIGN_TYPES[0] | null>(null);
    const [campaignName, setCampaignName] = useState('');
    const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
    const [suggestedTargets, setSuggestedTargets] = useState<any[]>([]);
    const [targetSource, setTargetSource] = useState<'suggested' | 'pipeline'>('suggested');
    const [creating, setCreating] = useState(false);

    // Fetch existing campaigns
    useEffect(() => {
        if (!user) { setLoadingCampaigns(false); return; }
        fetch(`/api/campaigns?userId=${user.id}`)
            .then(r => r.json())
            .then(d => { if (d.success) setCampaigns(d.data || []); })
            .catch(() => { })
            .finally(() => setLoadingCampaigns(false));
    }, [user]);

    const FREE_CAMPAIGN_LIMIT = 1;
    const hasReachedFreeLimit = !isPremium && campaigns.length >= FREE_CAMPAIGN_LIMIT;

    const openModal = (type: typeof CAMPAIGN_TYPES[0]) => {
        if (!user) { openAuthModal(); return; }
        if (hasReachedFreeLimit) { router.push('/pricing'); return; }
        if (type.premiumOnly && !isPremium) { router.push('/pricing'); return; }

        // Auto-number: count existing campaigns of this type
        const existing = campaigns.filter(c => c.type === type.id);
        const nextNum = existing.length + 1;
        setCampaignName(`${type.title} ${nextNum}`);

        // Load suggested targets
        const suggested = getSuggestedTargets(type.id);
        setSuggestedTargets(suggested);
        setSelectedTargets(suggested.slice(0, 6).map(t => t.id)); // pre-select first 6

        setTargetSource(suggested.length > 0 ? 'suggested' : 'pipeline');
        setSelectedType(type);
    };

    const closeModal = () => {
        if (creating) return;
        setSelectedType(null);
        setSelectedTargets([]);
    };

    const toggleTarget = (id: string) => {
        setSelectedTargets(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleCreate = async () => {
        if (!user || !selectedType || selectedTargets.length === 0 || creating) return;
        setCreating(true);

        const allTargetItems = targetSource === 'suggested' ? suggestedTargets : pipelineItems;
        const targets = allTargetItems
            .filter(t => selectedTargets.includes(t.id))
            .map(t => ({ id: t.id, name: t.name, url: t.url, kind: t.kind || 'community', status: 'pending' }));

        try {
            const res = await fetch('/api/campaigns', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, type: selectedType.id, name: campaignName, config: {}, targets }),
            });
            const data = await res.json();
            if (data.success && data.data) {
                router.push(`/campaign/${data.data.id}`);
            } else {
                alert(data.error || 'Failed to create campaign.');
                setCreating(false);
            }
        } catch {
            alert('An error occurred. Please try again.');
            setCreating(false);
        }
    };

    // Campaigns grouped by type
    const campaignsByType: Record<string, Campaign[]> = {};
    for (const c of campaigns) {
        if (!campaignsByType[c.type]) campaignsByType[c.type] = [];
        campaignsByType[c.type].push(c);
    }

    const activeTargets = targetSource === 'suggested' ? suggestedTargets : pipelineItems;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-black py-12 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-8">
                    <a href="/discover" className="text-white/40 hover:text-white text-sm transition-colors">← Discover</a>
                </div>

                <div className="mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
                        <Rocket className="w-3.5 h-3.5" /> Distribution Engine
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
                        Campaigns
                    </h1>
                    <p className="text-white/50 text-base max-w-xl">
                        Pick a campaign type, get smart channel suggestions based on your goal, and start distributing. Run as many campaigns as you want.
                    </p>
                </div>

                {/* Existing campaigns summary (if any) */}
                {!loadingCampaigns && campaigns.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-400" /> Your Active Campaigns
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {campaigns.slice(0, 6).map(c => {
                                const type = CAMPAIGN_TYPES.find(t => t.id === c.type);
                                const Icon = type?.icon || Zap;
                                const completed = c.targets?.filter((t: any) => t.status === 'completed').length || 0;
                                const total = c.targets?.length || 0;
                                return (
                                    <button
                                        key={c.id}
                                        onClick={() => router.push(`/campaign/${c.id}`)}
                                        className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 hover:border-white/20 rounded-2xl text-left group transition-all"
                                    >
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${type?.color || 'from-slate-500 to-slate-600'} flex items-center justify-center flex-shrink-0`}>
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-semibold text-sm truncate group-hover:text-indigo-300 transition-colors">{c.name}</p>
                                            <p className="text-white/40 text-xs mt-0.5">{completed}/{total} targets done</p>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/60 transition-colors" />
                                    </button>
                                );
                            })}
                            {campaigns.length > 6 && (
                                <div className="flex items-center justify-center p-4 bg-white/5 border border-white/10 rounded-2xl text-white/40 text-sm">
                                    +{campaigns.length - 6} more
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Campaign type grid */}
                <h2 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-400" /> Start a New Campaign
                </h2>

                {!isPremium && (
                    <div className={`mb-6 p-4 rounded-2xl flex items-center gap-4 border ${hasReachedFreeLimit
                        ? 'bg-red-500/5 border-red-500/20'
                        : 'bg-amber-500/5 border-amber-500/20'
                        }`}>
                        <Lock className={`w-5 h-5 flex-shrink-0 ${hasReachedFreeLimit ? 'text-red-400' : 'text-amber-400'}`} />
                        <div className="flex-1">
                            {hasReachedFreeLimit ? (
                                <>
                                    <p className="text-red-300 font-bold text-sm">Campaign limit reached (1/1)</p>
                                    <p className="text-red-400/60 text-xs mt-0.5">Upgrade to Pro for unlimited campaigns, all campaign types, and advanced analytics.</p>
                                </>
                            ) : (
                                <>
                                    <p className="text-amber-300 font-semibold text-sm">Free plan: 1 campaign with full analytics included.</p>
                                    <p className="text-amber-400/60 text-xs mt-0.5">Upgrade for unlimited campaigns and all campaign types.</p>
                                </>
                            )}
                        </div>
                        <button onClick={() => router.push('/pricing')} className={`px-4 py-2 text-xs font-bold rounded-xl border transition-colors whitespace-nowrap ${hasReachedFreeLimit
                            ? 'bg-red-500/20 hover:bg-red-500/30 text-red-300 border-red-500/30'
                            : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border-amber-500/20'
                            }`}>
                            Upgrade to Pro →
                        </button>
                    </div>
                )}

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {CAMPAIGN_TYPES.map((type, i) => {
                        const Icon = type.icon;
                        const isLocked = type.premiumOnly && !isPremium;
                        const existingCount = campaignsByType[type.id]?.length || 0;

                        return (
                            <motion.div
                                key={type.id}
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                onClick={() => openModal(type)}
                                className={`relative group cursor-pointer rounded-2xl border p-6 transition-all duration-200
                                    ${isLocked || hasReachedFreeLimit
                                        ? 'border-white/5 bg-white/3 opacity-60'
                                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 hover:-translate-y-0.5'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {existingCount > 0 && (
                                            <span className="px-2 py-0.5 bg-indigo-500/15 border border-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full">
                                                {existingCount} running
                                            </span>
                                        )}
                                        {isLocked && <Lock className="w-4 h-4 text-white/30" />}
                                    </div>
                                </div>

                                <h3 className="text-white font-bold text-base mb-2">{type.title}</h3>
                                <p className="text-white/50 text-sm leading-relaxed mb-4">{type.description}</p>

                                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                    <span className={`text-xs font-semibold ${isLocked ? 'text-amber-400'
                                        : hasReachedFreeLimit ? 'text-red-400'
                                            : 'text-indigo-400'
                                        }`}>
                                        {isLocked ? 'Pro required'
                                            : hasReachedFreeLimit ? 'Upgrade to add more'
                                                : existingCount > 0 ? `Distribute ${existingCount + 1}`
                                                    : 'Distribute'}
                                    </span>
                                    {!isLocked && !hasReachedFreeLimit && (
                                        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* ── Create Campaign Modal ─────────────────────────────────────── */}
            <AnimatePresence>
                {selectedType && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                            onClick={closeModal}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 16 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 16 }}
                            className="relative w-full max-w-2xl bg-[#0f1018] border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[90vh]"
                        >
                            {/* Modal header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/10">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${selectedType.color} flex items-center justify-center`}>
                                        <selectedType.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-lg leading-none">New {selectedType.title}</h2>
                                        <p className="text-white/40 text-xs mt-0.5">Select targets to distribute to</p>
                                    </div>
                                </div>
                                <button onClick={closeModal} disabled={creating} className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/5 transition-all">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Campaign name input */}
                            <div className="px-6 pt-5 pb-3">
                                <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2">Campaign Name</label>
                                <input
                                    type="text"
                                    value={campaignName}
                                    onChange={e => setCampaignName(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    placeholder="e.g. SEO Campaign 1"
                                />
                            </div>

                            {/* Source tabs */}
                            <div className="px-6 pb-3 flex gap-2">
                                <button
                                    onClick={() => { setTargetSource('suggested'); setSelectedTargets(suggestedTargets.slice(0, 6).map(t => t.id)); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${targetSource === 'suggested' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                                >
                                    ✨ Smart Suggestions ({suggestedTargets.length})
                                </button>
                                <button
                                    onClick={() => { setTargetSource('pipeline'); setSelectedTargets(pipelineItems.map((t: any) => t.id)); }}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${targetSource === 'pipeline' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-white/50 hover:bg-white/10'}`}
                                >
                                    My Pipeline ({pipelineItems.length})
                                </button>
                            </div>

                            {/* Target list */}
                            <div className="flex-1 overflow-y-auto px-6 pb-4 space-y-2">
                                {activeTargets.length === 0 ? (
                                    <div className="text-center py-10 border border-dashed border-white/10 rounded-2xl">
                                        <p className="text-white/40 text-sm mb-3">
                                            {targetSource === 'pipeline' ? 'Your pipeline is empty.' : 'No suggestions available.'}
                                        </p>
                                        {targetSource === 'pipeline' && (
                                            <button onClick={() => router.push('/discover')} className="text-xs text-indigo-400 hover:text-indigo-300 underline">
                                                Browse channels to add →
                                            </button>
                                        )}
                                    </div>
                                ) : (
                                    activeTargets.map((item: any) => {
                                        const isSelected = selectedTargets.includes(item.id);
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => toggleTarget(item.id)}
                                                className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all
                                                    ${isSelected ? 'bg-indigo-500/10 border-indigo-500/40' : 'bg-white/5 border-white/5 hover:border-white/15'}`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-white font-medium text-sm truncate">{item.name}</p>
                                                        {item.platform && (
                                                            <span className="text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded font-medium flex-shrink-0">{item.platform}</span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-white/30 text-xs truncate">{item.category}</p>
                                                        {item.memberCount && (
                                                            <span className="text-[10px] text-white/20">• {(item.memberCount / 1000).toFixed(0)}k members</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ml-3 transition-all
                                                    ${isSelected ? 'bg-indigo-500 border-indigo-500' : 'border-white/20'}`}>
                                                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-white/10 flex items-center justify-between">
                                <p className="text-white/50 text-sm">
                                    <span className="text-white font-bold">{selectedTargets.length}</span> targets selected
                                </p>
                                <button
                                    onClick={handleCreate}
                                    disabled={selectedTargets.length === 0 || creating || !campaignName.trim()}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all
                                        ${selectedTargets.length > 0 && !creating && campaignName.trim()
                                            ? 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-lg shadow-indigo-500/25'
                                            : 'bg-white/10 text-white/30 cursor-not-allowed'
                                        }`}
                                >
                                    {creating ? (
                                        <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating...</>
                                    ) : (
                                        <>Distribute <ArrowRight className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <PageGuide
                title="Campaigns"
                steps={[
                    { title: 'Choose a Strategy', description: 'Select a campaign type (like SEO, Beta Testers, or PR) based on your current distribution goal.' },
                    { title: 'Smart Suggestions', description: 'Once you click a campaign, we automatically suggest the best matched communities from our database to target.' },
                    { title: 'Use Your Pipeline', description: 'Alternatively, you can select communities you previously saved to your pipeline.' },
                    { title: 'Create Campaign', description: 'Click Distribute to generate your campaign workspace where you can track submissions and execute.' },
                ]}
            />
        </main>
    );
}
