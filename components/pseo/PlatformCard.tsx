import { SEOPlatform } from '@/types/platform';
import Link from 'next/link';

interface PlatformCardProps {
    platform: SEOPlatform;
    rank?: number;
    showScore?: boolean;
    score?: number;
}

export default function PlatformCard({ platform, rank, showScore, score }: PlatformCardProps) {
    const trustStars = Math.min(5, Math.max(1, Math.floor((platform.domainAuthority || 30) / 20) + 1));

    const typeColors: Record<string, string> = {
        directory: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        community: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        group: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    };

    const backlinkColors: Record<string, string> = {
        dofollow: 'text-green-400',
        nofollow: 'text-yellow-400',
        ugc: 'text-orange-400',
        sponsored: 'text-red-400',
        none: 'text-gray-500',
    };

    return (
        <Link
            href={`/platform/${platform.slug}`}
            className="group block glass rounded-xl p-5 hover:border-purple-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/10 hover:-translate-y-0.5"
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                    {rank && (
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white text-sm font-bold">
                            {rank}
                        </span>
                    )}
                    <div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                            {platform.name}
                        </h3>
                        {/* Star Rating */}
                        <div className="flex items-center gap-0.5 mt-0.5">
                            {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3 h-3 ${i < trustStars ? 'text-amber-400' : 'text-white/10'}`} fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${typeColors[platform.type] || typeColors.directory}`}>
                                {platform.type}
                            </span>
                            {platform.domainAuthority > 0 && (
                                <span className="text-xs text-gray-400">
                                    DA: <span className="text-white font-medium">{platform.domainAuthority}</span>
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                {showScore && score !== undefined && (
                    <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            {score}
                        </span>
                        <span className="text-xs text-gray-500">score</span>
                    </div>
                )}
            </div>

            <p className="text-sm text-gray-400 line-clamp-2 mb-3">
                {platform.description}
            </p>

            <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                    {platform.pricing && (
                        <span className="text-gray-400">
                            💰 {platform.pricing}
                        </span>
                    )}
                    {platform.backlinkType && (
                        <span className={backlinkColors[platform.backlinkType] || 'text-gray-400'}>
                            🔗 {platform.backlinkType}
                        </span>
                    )}
                </div>
                {platform.approval_time && (
                    <span className="text-gray-500">
                        ⏱ {platform.approval_time}
                    </span>
                )}
            </div>

            {platform.tags && platform.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                    {platform.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="text-xs px-2 py-0.5 rounded bg-white/5 text-gray-400">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}
        </Link>
    );
}
