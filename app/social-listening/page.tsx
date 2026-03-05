'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { Lock, Sparkles, MessageSquare, Search, MessageCircle, BarChart3 } from 'lucide-react';

export default function SocialListeningPage() {
    const { user } = useAuthStore();
    const isPremium = user?.isPremium;

    return (
        <main className="min-h-screen bg-[#0a0a0f] text-white">
            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                        <MessageCircle className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-bold text-indigo-400 uppercase tracking-widest">Active Monitoring</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        Social Listening
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl mx-auto">
                        Monitor Reddit, Twitter, and niche forums for keywords related to your startup in real-time.
                    </p>
                </div>

                <div className="relative">
                    {/* Mock Content */}
                    <div className="grid gap-4 opacity-20 pointer-events-none grayscale">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl flex items-start gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/10" />
                                <div className="flex-1 space-y-2">
                                    <div className="h-4 w-1/4 bg-white/10 rounded" />
                                    <div className="h-4 w-3/4 bg-white/10 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Lock Overlay for Free Users */}
                    {!isPremium && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-6">
                            <div className="p-8 bg-[#0f1018]/80 rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-2xl max-w-md">
                                <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
                                    <Lock className="w-10 h-10 text-indigo-400" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-3">Premium Feature</h3>
                                <p className="text-white/50 mb-8 leading-relaxed">
                                    Real-time Social Listening is exclusive to our Pro members. Distribution is much easier when you know who is talking about your niche.
                                </p>
                                <button
                                    className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                                    onClick={() => window.location.href = '/pricing'}
                                >
                                    <Sparkles className="w-4 h-4" /> Upgrade to Unlock
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Pro View - Mocked for now but unlocked */}
                    {isPremium && (
                        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-3xl p-12 text-center">
                            <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-4 animate-pulse" />
                            <h3 className="text-2xl font-bold mb-2">Social Listening Active</h3>
                            <p className="text-white/40 max-w-md mx-auto">
                                We are currently indexing Reddit and Twitter for your startup keywords.
                                Real-time alerts will appear here as soon as they are detected.
                            </p>
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="text-xs font-bold text-white/30 uppercase mb-1">Keywords</div>
                                    <div className="text-indigo-400 font-bold">{user?.startup?.name || 'Your Startup'}</div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="text-xs font-bold text-white/30 uppercase mb-1">Status</div>
                                    <div className="text-emerald-400 font-bold flex items-center justify-center gap-1">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" /> Scanning
                                    </div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                                    <div className="text-xs font-bold text-white/30 uppercase mb-1">Alerts</div>
                                    <div className="text-white font-bold">0 Today</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
