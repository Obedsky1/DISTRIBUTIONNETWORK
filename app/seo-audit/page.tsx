'use client';

import { useAuthStore } from '@/lib/store/auth-store';
import { BarChart3, Globe, Search, ShieldCheck, AlertCircle, Sparkles, Clock } from 'lucide-react';

export default function SEOAuditPage() {
    const { user } = useAuthStore();

    return (
        <main className="min-h-screen bg-[#0a0a0f] text-white p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4">
                            <BarChart3 className="w-3.5 h-3.5 text-indigo-400" />
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Technical SEO</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black">SEO Audit</h1>
                        <p className="text-white/40 mt-2 text-sm max-w-lg">
                            Analyze your startup's technical SEO health, metadata, and backlink strength automatically.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="glass-strong px-4 py-2 rounded-xl border border-white/5 flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-xs font-bold text-white/60 uppercase tracking-wider">Coming Soon</span>
                        </div>
                    </div>
                </div>

                <div className="relative group">
                    {/* Background Decorative Elements */}
                    <div className="absolute -top-24 -left-20 w-64 h-64 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                    <div className="absolute top-1/2 -right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none" />

                    {/* Coming Soon Hero Section */}
                    <div className="glass-strong p-12 md:p-20 rounded-[3rem] border border-white/10 text-center relative overflow-hidden backdrop-blur-2xl shadow-2xl">
                        {/* Interactive floating elements */}
                        <div className="absolute top-10 left-10 opacity-20 animate-bounce duration-[3000ms]">
                            <Search className="w-12 h-12 text-indigo-400" />
                        </div>
                        <div className="absolute bottom-20 right-10 opacity-20 animate-pulse duration-[4000ms]">
                            <Globe className="w-16 h-16 text-purple-400" />
                        </div>

                        <div className="relative z-10 max-w-2xl mx-auto">
                            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/40 relative">
                                <BarChart3 className="w-12 h-12 text-white" />
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center border-4 border-[#0a0a0f]">
                                    <Sparkles className="w-4 h-4 text-white" />
                                </div>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black mb-6 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">
                                Intelligence for your <br />
                                <span className="text-indigo-500">Search Presence</span>
                            </h2>

                            <p className="text-white/50 mb-12 text-lg leading-relaxed">
                                We're building a powerful technical SEO auditor that will crawl your site,
                                identify bottlenecks, and give you actionable insights to dominate search rankings.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                                <div className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm font-bold text-white/40 flex items-center gap-3">
                                    <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                    Development in Progress
                                </div>
                                <button className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-3 active:scale-95 group">
                                    Notify Me When Ready
                                    <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Feature Preview Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                        {[
                            {
                                title: 'Technical Scan',
                                desc: 'Automatic checks for sitemap, robots.txt, SSL status, and site performance metrics.',
                                icon: ShieldCheck,
                                color: 'text-emerald-400'
                            },
                            {
                                title: 'Content Health',
                                desc: 'Analyze heading structure, meta descriptions, and keyword density for maximum relevance.',
                                icon: AlertCircle,
                                color: 'text-amber-400'
                            },
                            {
                                title: 'Backlink Analysis',
                                desc: 'Deep dive into your backlink profile, domain authority, and internal linking strategies.',
                                icon: BarChart3,
                                color: 'text-indigo-400'
                            },
                        ].map((f, i) => (
                            <div key={i} className="glass-strong p-8 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all group hover:-translate-y-1">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-500/10 transition-colors">
                                    <f.icon className={`w-6 h-6 ${f.color}`} />
                                </div>
                                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                                <p className="text-sm text-white/40 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
