'use client';

import { Community } from '@/types';
import { CheckCircle, AlertCircle, HelpCircle, BookOpen, Target, ShieldCheck, TrendingUp, Info } from 'lucide-react';

interface CommunityDetailSectionsProps {
    community: Community;
}

export default function CommunityDetailSections({ community }: CommunityDetailSectionsProps) {
    return (
        <div className="space-y-16 py-12">
            {/* Overview Section */}
            {(community.longDescription || community.description) && (
                <section id="overview" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-500/10 rounded-lg">
                            <Info className="w-5 h-5 text-indigo-400" />
                        </div>
                        <h2 className="text-2xl font-bold">About {community.name}</h2>
                    </div>
                    <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10 shadow-xl shadow-black/20">
                        {community.longDescription || community.description}
                    </div>
                </section>
            )}

            {/* Who is it for & Why Join */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {community.whoShouldUseIt && (
                    <section id="for-whom" className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-xl shadow-black/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Target className="w-5 h-5 text-purple-400" />
                            </div>
                            <h2 className="text-xl font-bold">Who is it for?</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            {community.whoShouldUseIt}
                        </p>
                        {community.stageFit && (
                            <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-2">
                                <span className="text-sm font-medium text-gray-400 uppercase tracking-wider">Best stage fit:</span>
                                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-300 rounded-md text-sm font-medium border border-indigo-500/30">
                                    {community.stageFit}
                                </span>
                            </div>
                        )}
                    </section>
                )}

                {community.whyJoin && (
                    <section id="why-join" className="bg-indigo-600/10 p-8 rounded-3xl border border-indigo-500/20 shadow-xl shadow-indigo-900/10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-indigo-400" />
                            </div>
                            <h2 className="text-xl font-bold">Why founders join</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed">
                            {community.whyJoin}
                        </p>
                    </section>
                )}
            </div>

            {/* Content Strategy & Rules */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {(community.whatWorksBest || community.founderStrategy || community.useCases?.length > 0) && (
                    <section id="content-strategy" className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-xl shadow-black/20">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                <BookOpen className="w-5 h-5 text-yellow-400" />
                            </div>
                            <h2 className="text-xl font-bold">How to succeed here</h2>
                        </div>
                        {community.whatWorksBest && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Best Content Types</h3>
                                <p className="text-gray-300 leading-relaxed">{community.whatWorksBest}</p>
                            </div>
                        )}
                        {community.founderStrategy && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Founder Playbook</h3>
                                <p className="text-gray-300 leading-relaxed italic border-l-2 border-indigo-500/50 pl-4">{community.founderStrategy}</p>
                            </div>
                        )}
                    </section>
                )}

                {(community.selfPromoPolicy || community.postingRules || community.moderationStyle) && (
                    <section id="rules" className="bg-white/5 p-8 rounded-3xl border border-white/10 shadow-xl shadow-black/20 relative overflow-hidden">
                        <div className={`absolute top-0 right-0 p-4 opacity-5 pointer-events-none`}>
                            <ShieldCheck className="w-24 h-24 text-white" />
                        </div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-500/10 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <h2 className="text-xl font-bold">Community Rules</h2>
                        </div>
                        {community.selfPromoPolicy && (
                            <div className="mb-6">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Self-Promotion Policy</h3>
                                <div className="px-4 py-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                                    <p className="text-gray-300 text-sm leading-relaxed">{community.selfPromoPolicy}</p>
                                </div>
                            </div>
                        )}
                        {community.postingRules && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-3">Posting Guidelines</h3>
                                <p className="text-gray-300 text-sm leading-relaxed">{community.postingRules}</p>
                            </div>
                        )}
                    </section>
                )}
            </div>

            {/* Pros & Cons */}
            {((community.pros?.length ?? 0) > 0 || (community.cons?.length ?? 0) > 0) && (
                <section id="pros-cons" className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {community.pros && community.pros.length > 0 && (
                        <div className="bg-green-500/5 p-8 rounded-3xl border border-green-500/10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                Pros
                            </h3>
                            <ul className="space-y-3">
                                {community.pros.map((pro, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                        {pro}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {community.cons && community.cons.length > 0 && (
                        <div className="bg-red-500/5 p-8 rounded-3xl border border-red-500/10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-red-400">
                                <AlertCircle className="w-5 h-5" />
                                Cons
                            </h3>
                            <ul className="space-y-3">
                                {community.cons.map((con, i) => (
                                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                        {con}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </section>
            )}

            {/* FAQ Section */}
            {community.faq && community.faq.length > 0 && (
                <section id="faq" className="scroll-mt-24">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                            <HelpCircle className="w-5 h-5 text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold">Common Questions</h2>
                    </div>
                    <div className="space-y-4">
                        {community.faq.map((item, i) => (
                            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-6 shadow-lg shadow-black/20">
                                <h3 className="text-lg font-semibold text-white mb-2">{item.question}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{item.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
