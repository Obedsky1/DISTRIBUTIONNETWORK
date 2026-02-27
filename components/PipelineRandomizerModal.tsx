'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Plus, Check, RefreshCw } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { updateDocument } from '@/lib/firebase/firestore';

interface Item {
    id: string;
    kind: 'community' | 'directory';
    name: string;
    description: string;
    url: string;
    platform?: string; // Community
    category?: string; // Directory or Community (array)
}

interface PipelineRandomizerModalProps {
    isOpen: boolean;
    onClose: () => void;
    mixedFeed: any[];
}

export default function PipelineRandomizerModal({ isOpen, onClose, mixedFeed }: PipelineRandomizerModalProps) {
    const { user, openAuthModal } = useAuthStore();
    const [recommendations, setRecommendations] = useState<Item[]>([]);
    const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
    const [adding, setAdding] = useState(false);

    useEffect(() => {
        if (isOpen && mixedFeed.length > 0) {
            generateRecommendations();
        }
    }, [isOpen, mixedFeed]);

    const generateRecommendations = () => {
        // Try to get a mix of different categories: 
        // 1 SEO/Content, 1 Beta Launch/Product Hunt, 1 Community/Group, 1 Directory, 1 random

        const seoItems = mixedFeed.filter(i =>
            i.category?.includes('SEO') || i.categories?.includes('SEO') || i.description?.toLowerCase().includes('seo')
        );
        const launchItems = mixedFeed.filter(i =>
            i.category?.includes('Launch') || i.category?.includes('Startup') || i.categories?.includes('Startup') || i.description?.toLowerCase().includes('launch') || i.name?.toLowerCase().includes('product hunt')
        );
        const communityItems = mixedFeed.filter(i => i.kind === 'community');
        const directoryItems = mixedFeed.filter(i => i.kind === 'directory');

        const pickRandom = (arr: any[]) => arr.length > 0 ? arr[Math.floor(Math.random() * arr.length)] : null;

        const selected = new Set<any>();

        const seo = pickRandom(seoItems);
        if (seo) selected.add(seo);

        // keep adding while we don't have 5 elements
        const launch = pickRandom(launchItems.filter(i => !selected.has(i)));
        if (launch) selected.add(launch);

        const comm = pickRandom(communityItems.filter(i => !selected.has(i)));
        if (comm) selected.add(comm);

        const dir = pickRandom(directoryItems.filter(i => !selected.has(i)));
        if (dir) selected.add(dir);

        // Fill the rest up to 5
        let attempts = 0;
        while (selected.size < 5 && attempts < 20) {
            const random = pickRandom(mixedFeed);
            if (random && !selected.has(random)) {
                selected.add(random);
            }
            attempts++;
        }

        setRecommendations(Array.from(selected));

        // initialize added ids based on user pipeline
        if (user?.distroPipeline) {
            const existingIds = new Set(user.distroPipeline.map(p => p.id));
            setAddedIds(existingIds);
        } else {
            setAddedIds(new Set());
        }
    };

    const handleAddToPipeline = async (item: Item) => {
        if (!user) {
            openAuthModal();
            return;
        }

        if (addedIds.has(item.id)) return;

        setAdding(true);
        try {
            const newPipelineItem = {
                id: item.id,
                kind: item.kind,
                name: item.name,
                url: item.url,
                category: item.kind === 'directory' ? item.category : (item as any).categories?.[0] || 'Community'
            };

            const currentPipeline = user.distroPipeline || [];
            const updatedPipeline = [...currentPipeline, newPipelineItem];

            await updateDocument('users', user.id, { distroPipeline: updatedPipeline });

            useAuthStore.setState({
                user: { ...user, distroPipeline: updatedPipeline }
            });

            setAddedIds(prev => {
                const newSet = new Set(prev);
                newSet.add(item.id);
                return newSet;
            });
        } catch (error) {
            console.error("Failed to add to pipeline", error);
        } finally {
            setAdding(false);
        }
    };

    const handleAddAll = async () => {
        if (!user) {
            openAuthModal();
            return;
        }

        setAdding(true);
        try {
            const currentPipeline = user.distroPipeline || [];
            const existingIdsThisSession = new Set(currentPipeline.map(p => p.id));

            const newItems = recommendations
                .filter(item => !existingIdsThisSession.has(item.id))
                .map(item => ({
                    id: item.id,
                    kind: item.kind,
                    name: item.name,
                    url: item.url,
                    category: item.kind === 'directory' ? item.category : (item as any).categories?.[0] || 'Community'
                }));

            if (newItems.length === 0) {
                setAdding(false);
                return;
            }

            const updatedPipeline = [...currentPipeline, ...newItems];

            await updateDocument('users', user.id, { distroPipeline: updatedPipeline });

            useAuthStore.setState({
                user: { ...user, distroPipeline: updatedPipeline }
            });

            setAddedIds(prev => {
                const newSet = new Set(prev);
                newItems.forEach(i => newSet.add(i.id));
                return newSet;
            });
        } catch (error) {
            console.error("Failed to add all to pipeline", error);
        } finally {
            setAdding(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-gray-950/80 backdrop-blur-md"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-3xl bg-gray-900 border border-white/10 shadow-2xl flex flex-col"
                >
                    {/* Header */}
                    <div className="flex-shrink-0 px-6 py-5 border-b border-white/10 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/20 blur-[80px] -z-10 rounded-full" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 blur-[60px] -z-10 rounded-full" />

                        <button
                            onClick={onClose}
                            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                                <Sparkles className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">AI Recommendation curated list</h2>
                                <p className="text-sm text-white/60">Generate random channels across different aspects (SEO, Beta Launch, Groups) and add them to your distribution pipeline.</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent space-y-4">
                        {recommendations.map((item, index) => {
                            const isAdded = addedIds.has(item.id);

                            // Determine aspect tag
                            let aspectLabel = 'Community';
                            let aspectColor = 'bg-gray-500/20 text-gray-300 border-gray-500/30';

                            if (item.kind === 'directory') {
                                if (item.category?.includes('SEO') || item.description?.toLowerCase().includes('seo')) {
                                    aspectLabel = 'SEO Boosting';
                                    aspectColor = 'bg-blue-500/20 text-blue-300 border-blue-500/30';
                                } else if (item.category?.includes('Launch') || item.description?.toLowerCase().includes('launch')) {
                                    aspectLabel = 'Beta Launch';
                                    aspectColor = 'bg-orange-500/20 text-orange-300 border-orange-500/30';
                                } else {
                                    aspectLabel = 'Directory';
                                    aspectColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
                                }
                            } else {
                                aspectLabel = 'Group to scale';
                                aspectColor = 'bg-purple-500/20 text-purple-300 border-purple-500/30';
                            }

                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={item.id}
                                    className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${aspectColor}`}>
                                                {aspectLabel}
                                            </span>
                                            <h3 className="font-bold text-white truncate text-sm">{item.name}</h3>
                                        </div>
                                        <p className="text-xs text-white/50 line-clamp-2 leading-relaxed">{item.description}</p>
                                    </div>

                                    <button
                                        onClick={() => handleAddToPipeline(item)}
                                        disabled={isAdded || adding}
                                        className={`flex-shrink-0 flex items-center justify-center gap-2 w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold transition-all ${isAdded
                                            ? 'bg-green-500/20 text-green-400 border border-green-500/30 cursor-default'
                                            : 'bg-white/10 hover:bg-violet-600 border border-white/10 hover:border-violet-500 text-white'
                                            }`}
                                    >
                                        {isAdded ? <><Check className="w-3.5 h-3.5" /> Added</> : <><Plus className="w-3.5 h-3.5" /> Add to Pipeline</>}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div className="flex-shrink-0 p-6 border-t border-white/10 bg-gray-900/80 flex flex-col sm:flex-row gap-3 justify-between items-center relative z-10">
                        <button
                            onClick={generateRecommendations}
                            className="flex items-center gap-2 text-xs font-semibold text-white/50 hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-white/5"
                        >
                            <RefreshCw className="w-3.5 h-3.5" /> Re-roll Recommendations
                        </button>

                        <div className="flex gap-3 w-full sm:w-auto">
                            <button
                                onClick={onClose}
                                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl border border-white/10 text-white hover:bg-white/5 text-sm font-semibold transition-all"
                            >
                                Done
                            </button>
                            <button
                                onClick={handleAddAll}
                                disabled={adding || recommendations.every(r => addedIds.has(r.id))}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white text-sm font-semibold shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="w-4 h-4" /> Add All to Pipeline
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
