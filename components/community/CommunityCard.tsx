'use client';

import { Community } from '@/types';
import { formatNumber, getPlatformIcon, getPlatformColor, getActivityColor } from '@/lib/utils/helpers';
import { Users, Activity, ExternalLink, Heart } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';

interface CommunityCardProps {
    community: Community;
    matchScore?: number;
    onSave?: (id: string) => void;
    onJoin?: (id: string) => void;
}

export default function CommunityCard({ community, matchScore, onSave, onJoin }: CommunityCardProps) {
    const [isSaved, setIsSaved] = useState(false);
    const slug = community.slug || community.id;

    const handleSave = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsSaved(!isSaved);
        onSave?.(community.id);
    };

    const handleJoin = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onJoin?.(community.id);
        window.open(community.url, '_blank');
    };

    return (
        <Link href={`/community/${slug}`} className="block group">
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:glass-strong transition-all h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start gap-4 mb-4">
                    {/* Icon */}
                    {community.imageUrl ? (
                        <img
                            src={community.imageUrl}
                            alt={community.name}
                            className="w-16 h-16 rounded-xl object-cover"
                        />
                    ) : (
                        <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${getPlatformColor(community.platform)} flex items-center justify-center text-2xl`}>
                            {getPlatformIcon(community.platform)}
                        </div>
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-lg truncate group-hover:text-indigo-400 transition-colors">{community.name}</h3>
                            {matchScore !== undefined && (
                                <div className="px-2 py-1 bg-purple-500/20 rounded-lg text-xs font-medium text-purple-400 whitespace-nowrap">
                                    {Math.round(matchScore * 100)}% match
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                            <span className="capitalize">{community.platform}</span>
                            <span>•</span>
                            <span className={getActivityColor(community.activityLevel)}>
                                {community.activityLevel} activity
                            </span>
                        </div>
                    </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-300 mb-4 line-clamp-2 flex-1">
                    {community.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                    {community.category.slice(0, 3).map((cat) => (
                        <span
                            key={cat}
                            className="px-2 py-1 bg-white/5 rounded-lg text-xs text-gray-400"
                        >
                            {cat}
                        </span>
                    ))}
                </div>

                {/* Stats */}
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{formatNumber(community.memberCount)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Activity className="w-4 h-4" />
                        <span className="capitalize">{community.activityLevel}</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <button
                        onClick={handleJoin}
                        className="flex-1 px-4 py-2.5 sm:py-2 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-medium hover:scale-105 transition-transform flex items-center justify-center gap-2 touch-target text-sm sm:text-base cursor-pointer"
                    >
                        <ExternalLink className="w-4 h-4" />
                        Visit
                    </button>
                    <button
                        onClick={handleSave}
                        className={`px-4 py-2.5 sm:py-2 rounded-xl font-medium transition-all touch-target cursor-pointer ${isSaved
                            ? 'bg-pink-500/20 text-pink-400'
                            : 'glass hover:glass-strong'
                            }`}
                    >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </div>
        </Link>
    );
}
