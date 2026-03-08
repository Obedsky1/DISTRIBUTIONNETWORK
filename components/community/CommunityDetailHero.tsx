'use client';

import { Community } from '@/types';
import { getPlatformIcon, getPlatformColor, formatNumber } from '@/lib/utils/helpers';
import { Users, ArrowRight, Globe, Shield, Zap } from 'lucide-react';

import { useRouter } from 'next/navigation';

interface CommunityDetailHeroProps {
    community: Community;
}

export default function CommunityDetailHero({ community }: CommunityDetailHeroProps) {
    const router = useRouter();

    const handleVisit = () => {
        router.push('/auth/signup?redirect=/workspace');
    };

    const ctaLabel = `Start Distribution to ${community.name}`;

    return (
        <section className="relative pt-24 pb-12 sm:pt-32 sm:pb-20 overflow-hidden">
            {/* Background Glow */}
            <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-indigo-600/10 to-transparent blur-3xl -z-10`} />

            <div className="container-tight px-4 sm:px-6">
                <div className="flex flex-col md:flex-row items-center md:items-end gap-8">
                    {/* Icon/Image */}
                    <div className="relative group">
                        {community.imageUrl ? (
                            <img
                                src={community.imageUrl}
                                alt={community.name}
                                className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl object-cover shadow-2xl ring-4 ring-white/5"
                            />
                        ) : (
                            <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-2xl sm:rounded-3xl bg-gradient-to-br ${getPlatformColor(community.platform)} flex items-center justify-center text-4xl sm:text-5xl shadow-2xl ring-4 ring-white/5`}>
                                {getPlatformIcon(community.platform)}
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-4 border-[#0a0a0b] flex items-center justify-center" title="Verified Community">
                            <Shield className="w-3 h-3 text-white fill-current" />
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 text-center md:text-left">
                        <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                            <span className="px-3 py-1 bg-white/5 rounded-full text-xs font-medium text-gray-400 border border-white/10 uppercase tracking-wider">
                                {community.platform}
                            </span>
                            {community.niche && (
                                <span className="px-3 py-1 bg-indigo-500/10 rounded-full text-xs font-medium text-indigo-400 border border-indigo-500/20">
                                    {community.niche}
                                </span>
                            )}
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                            {community.name}
                        </h1>
                        <p className="text-lg text-gray-400 mb-6 max-w-2xl mx-auto md:mx-0">
                            {community.shortDescription || community.description}
                        </p>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap justify-center md:justify-start gap-6 text-sm text-gray-400">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-indigo-400" />
                                <span><strong className="text-white">{formatNumber(community.memberCount)}</strong> members</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-yellow-400" />
                                <span className="capitalize"><strong className="text-white">{community.activityLevel}</strong> activity</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-400" />
                                <span>{community.platformType || 'Community'}</span>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="flex flex-col gap-3 min-w-[200px]">
                        <button
                            onClick={handleVisit}
                            className="w-full px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl font-semibold hover:scale-105 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 group"
                        >
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            {ctaLabel}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}
