'use client';

import { Community } from '@/types';
import CommunityDetailHero from './CommunityDetailHero';
import CommunityDetailSections from './CommunityDetailSections';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface CommunityDetailViewProps {
    community: Community;
    relatedCommunities?: Community[];
}

export default function CommunityDetailView({ community, relatedCommunities = [] }: CommunityDetailViewProps) {
    return (
        <main className="min-h-screen bg-[#0a0a0b] text-white font-sans selection:bg-indigo-500/30">
            {/* Navigation Header */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0b]/80 backdrop-blur-xl border-b border-white/5">
                <div className="container-tight px-4 sm:px-6 h-16 flex items-center justify-between">
                    <Link
                        href="/startup-communities"
                        className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Communities
                    </Link>
                    <div className="hidden sm:flex items-center gap-6">
                        <a href="#overview" className="text-sm text-gray-400 hover:text-white transition-colors">Overview</a>
                        <a href="#rules" className="text-sm text-gray-400 hover:text-white transition-colors">Rules</a>
                        {community.faq && community.faq.length > 0 && (
                            <a href="#faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</a>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <CommunityDetailHero community={community} />

            {/* Content Container */}
            <div className="container-tight px-4 sm:px-6 pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <CommunityDetailSections community={community} />
                    </div>

                    {/* Sidebar */}
                    <aside className="lg:col-span-4 space-y-8 pt-12">
                        {/* Internal Metadata Card */}
                        <div className="glass p-6 rounded-3xl border border-white/10 sticky top-24">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-indigo-400" />
                                Community Quick-View
                            </h3>
                            <div className="space-y-4">
                                <DetailItem label="Platform" value={community.platform} />
                                <DetailItem label="Platform Type" value={community.platformType || 'Community'} />
                                <DetailItem label="Niche" value={community.niche || 'General Startup'} />
                                <DetailItem label="Audience" value={community.audience || 'Founders'} />
                                <DetailItem label="Pricing" value={community.pricingType || 'Free'} />
                                <DetailItem label="Stage Fit" value={community.stageFit || 'Any'} />
                            </div>

                            {/* Internal CTA */}
                            <div className="mt-8 pt-6 border-t border-white/10">
                                <Link
                                    href="/workspace"
                                    className="block w-full text-center py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors border border-white/10"
                                >
                                    Add to my Distribution Plan
                                </Link>
                            </div>
                        </div>

                        {/* Related Communities */}
                        {relatedCommunities.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest pl-2">Related Communities</h3>
                                <div className="space-y-3">
                                    {relatedCommunities.map((rc) => (
                                        <Link
                                            key={rc.id}
                                            href={`/community/${rc.slug}`}
                                            className="block glass p-4 rounded-2xl border border-white/5 hover:border-indigo-500/30 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
                                                    {rc.imageUrl ? <img src={rc.imageUrl} className="w-full h-full object-cover rounded-lg" /> : '💬'}
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold group-hover:text-indigo-400 transition-colors line-clamp-1">{rc.name}</h4>
                                                    <p className="text-xs text-gray-500">{rc.platform}</p>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </aside>
                </div>

                {/* Final CTA Section */}
                <section className="mt-32 relative overflow-hidden rounded-[2.5rem] bg-indigo-600 px-6 py-16 sm:px-12 sm:py-24 text-center">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Ready to distribute your startup?
                        </h2>
                        <p className="text-indigo-100 text-lg mb-10">
                            Join {community.name} and 850+ other communities using our optimized distribution workflow.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link
                                href="/auth/signup"
                                className="w-full sm:w-auto px-8 py-4 bg-white text-indigo-600 rounded-2xl font-bold hover:scale-105 transition-all shadow-xl shadow-black/20"
                            >
                                Start Free Trial
                            </Link>
                            <Link
                                href="/pricing"
                                className="w-full sm:w-auto px-8 py-4 bg-indigo-500/50 text-white rounded-2xl font-bold border border-indigo-400/30 hover:bg-indigo-500/70 transition-all"
                            >
                                View Pricing
                            </Link>
                        </div>
                    </div>
                </section>
            </div>

            {/* Simple Footer */}
            <footer className="border-t border-white/5 py-12 text-center text-sm text-gray-500">
                <div className="container-tight px-4">
                    <p>&copy; {new Date().getFullYear()} DistriBurst. All rights reserved.</p>
                </div>
            </footer>
        </main>
    );
}

function DetailItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 py-2 border-b border-white/5 last:border-0">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="text-sm font-medium text-gray-200 text-right">{value}</span>
        </div>
    );
}
