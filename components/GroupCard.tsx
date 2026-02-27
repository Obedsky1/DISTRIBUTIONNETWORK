'use client';

import { motion } from 'framer-motion';
import { Users, TrendingUp, ExternalLink } from 'lucide-react';
import { Community } from '@/types';

interface GroupCardProps {
    community: Community;
    index: number;
}

const platformIcons: Record<string, string> = {
    discord: '💬',
    reddit: '🔴',
    telegram: '✈️',
    directory: '📁',
    website: '🌐',
    other: '🔗',
};

const activityColors = {
    low: 'from-slate-600 to-slate-700',
    medium: 'from-amber-600 to-orange-700',
    high: 'from-emerald-500 to-green-600',
};

export default function GroupCard({ community, index }: GroupCardProps) {
    const delay = index * 0.1;

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay, ease: [0.25, 0.1, 0.25, 1] }}
            whileHover={{ scale: 1.02, y: -5 }}
            className="group relative"
        >
            <div className="glass rounded-2xl p-6 h-full flex flex-col gap-4 hover:bg-white/10 transition-all duration-300 border border-white/10 hover:border-white/20 overflow-hidden">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${activityColors[community.activityLevel]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* Content */}
                <div className="relative z-10">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{platformIcons[community.platform]}</span>
                                <span className="text-xs px-2 py-1 rounded-full bg-white/10 text-white/70 capitalize">
                                    {community.platform}
                                </span>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 line-clamp-1">
                                {community.name}
                            </h3>
                        </div>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-white/70 line-clamp-2 mb-4">
                        {community.description}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {community.category.slice(0, 2).map((cat, i) => (
                            <span
                                key={i}
                                className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-300 border border-primary-500/30"
                            >
                                {cat}
                            </span>
                        ))}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1 text-white/60">
                                <Users className="w-4 h-4" />
                                <span>{community.memberCount.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                <span className={`capitalize text-${community.activityLevel === 'high' ? 'green' : community.activityLevel === 'medium' ? 'amber' : 'slate'}-400`}>
                                    {community.activityLevel}
                                </span>
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 rounded-lg bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 transition-colors"
                            aria-label="View community"
                        >
                            <ExternalLink className="w-4 h-4" />
                        </motion.button>
                    </div>
                </div>

                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            </div>
        </motion.div>
    );
}
