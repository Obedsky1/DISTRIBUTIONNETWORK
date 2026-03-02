"use client";

import React, { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';
import PricingCards from '@/components/PricingCards';
import {
    ArrowRight, Zap, Users, Globe, BarChart2, Sparkles,
    Link2, CheckCircle2, Star, ChevronRight
} from 'lucide-react';

const PLATFORMS = [
    'Product Hunt', 'BetaList', 'Indie Hackers', 'Reddit', 'Hacker News',
    'AppSumo', 'G2', 'Capterra', 'Crunchbase', 'AngelList',
    'Dev.to', 'Medium', 'Discord', 'Slack Communities', 'LinkedIn Groups',
    'Product Hunt', 'BetaList', 'Indie Hackers', 'Reddit', 'Hacker News',
];

const FEATURES = [
    {
        icon: Globe,
        color: 'bg-blue-50 text-blue-600',
        title: 'Distribution Pipeline',
        description: 'Submit your product to 850+ curated directories, communities, and channels with one organized workflow.',
    },
    {
        icon: Users,
        color: 'bg-emerald-50 text-emerald-600',
        title: 'Community Discovery',
        description: 'Find the exact Slack groups, Discord servers, subreddits and forums where your target audience actually hangs out.',
    },
    {
        icon: Zap,
        color: 'bg-amber-50 text-amber-600',
        title: 'Drip Campaigns',
        description: 'Work through your distribute targets in smart batches. Stay consistent without burning out.',
    },
    {
        icon: Link2,
        color: 'bg-purple-50 text-purple-600',
        title: 'SEO Backlink Tracking',
        description: 'Automatically verify and track the backlinks your submissions generate — dofollow, nofollow, and more.',
    },
    {
        icon: Sparkles,
        color: 'bg-pink-50 text-pink-600',
        title: 'Auto-Generated Assets',
        description: 'Get AI-crafted taglines, descriptions, and copy pre-formatted for every platform you submit to.',
    },
    {
        icon: BarChart2,
        color: 'bg-indigo-50 text-indigo-600',
        title: 'Analytics Dashboard',
        description: 'Track your submission progress, backlink growth, and overall distribution reach in one place.',
    },
];

const STEPS = [
    {
        num: '01',
        title: 'Set up your startup profile',
        description: 'Add your product name, description, logo, and key links once. We reuse them everywhere.',
        color: 'from-blue-500 to-indigo-600',
    },
    {
        num: '02',
        title: 'Pick your channels',
        description: 'Browse 850+ directories and communities filtered by niche, audience, and impact.',
        color: 'from-emerald-500 to-teal-600',
    },
    {
        num: '03',
        title: 'Distribute & track results',
        description: 'Execute your distribution, monitor backlinks, and watch your visibility grow over time.',
        color: 'from-purple-500 to-fuchsia-600',
    },
];

const TESTIMONIALS = [
    {
        initials: 'MK',
        gradient: 'from-blue-400 to-indigo-500',
        name: 'Marc Klein',
        handle: '@marcklein_dev',
        text: 'Just used DistroHub to submit to 40+ directories in 2 hours. Got 3 sign-ups the same day 🔥 This tool is a game changer for solo founders.',
        likes: 142,
        reposts: 38,
        date: 'Mar 12, 2025',
    },
    {
        initials: 'SA',
        gradient: 'from-emerald-400 to-teal-500',
        name: 'Sara Adeola',
        handle: '@sara_builds',
        text: 'The community discovery feature alone saved me 10+ hours of research. Found niche Slack groups I had no idea existed. Must-have for product distributes 🚀',
        likes: 87,
        reposts: 21,
        date: 'Feb 28, 2025',
    },
    {
        initials: 'JL',
        gradient: 'from-orange-400 to-red-500',
        name: 'James Liu',
        handle: '@jliu_founder',
        text: 'Went from 0 to 200 waitlist sign-ups in a week. The drip campaign feature keeps things organised and manageable. Incredible ROI 💸',
        likes: 203,
        reposts: 55,
        date: 'Jan 15, 2025',
    },
];

const X_ICON = (
    <svg className="w-4 h-4 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

export default function HomePage() {
    const { user, openAuthModal } = useAuthStore();
    const tickerRef = useRef<HTMLDivElement>(null);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden">

            {/* ── Navbar ── */}
            <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/90 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-5 md:px-10 py-4 flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2.5 no-underline">
                        <div className="grid grid-cols-2 gap-[4px]">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
                            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
                            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
                            <div className="w-2.5 h-2.5 bg-slate-900 rounded-full" />
                        </div>
                        <span className="font-bold text-xl tracking-tight">
                            Distro<span className="text-blue-500">Hub</span>
                        </span>
                    </a>

                    <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-slate-600">
                        <a href="/discover" className="hover:text-slate-900 transition-colors">Channels</a>
                        <a href="/dashboard/communities" className="hover:text-slate-900 transition-colors">Communities</a>
                        <a href="/dashboard/directories" className="hover:text-slate-900 transition-colors">Directories</a>
                        <a href="#pricing" className="hover:text-slate-900 transition-colors">Pricing</a>
                    </div>

                    <div className="flex items-center gap-3">
                        {user ? (
                            <Link href="/account" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
                                Dashboard
                            </Link>
                        ) : (
                            <button onClick={openAuthModal} className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
                                Sign in
                            </button>
                        )}
                        <a href="/discover" className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors shadow-sm">
                            Get started free <ChevronRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </nav>

            {/* ── Hero ── */}
            <section className="relative overflow-hidden bg-white pt-20 pb-16 px-5 md:px-10">
                {/* Subtle grid background */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.035]"
                    style={{ backgroundImage: 'linear-gradient(#000 1px,transparent 1px),linear-gradient(90deg,#000 1px,transparent 1px)', backgroundSize: '48px 48px' }} />
                {/* Glow blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    {/* Badge */}
                    <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
                        <Zap className="w-3.5 h-3.5" />
                        850+ distribution channels — all in one place
                    </div>

                    <h1 className="text-[48px] md:text-[72px] font-black tracking-[-0.03em] text-slate-900 leading-[1.05] mb-6">
                        Distribute your product<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">to thousands of people.</span>
                    </h1>

                    <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
                        DistroHub is the distribution engine for startup founders. Submit to 850+ directories, discover communities, run drip campaigns, and track every backlink — from one dashboard.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
                        <a href="/discover" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-bold text-base px-7 py-3.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all">
                            Start distributing free <ArrowRight className="w-4 h-4" />
                        </a>
                        <a href="#how-it-works" className="inline-flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-base px-7 py-3.5 rounded-xl border border-slate-200 transition-all">
                            See how it works
                        </a>
                    </div>

                    {/* Trust line */}
                    <p className="text-sm text-slate-400 flex items-center justify-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Trusted by 1,200+ founders. No credit card required.
                    </p>

                    {/* Stat badges */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                        {[
                            { val: '850+', label: 'Channels' },
                            { val: '500+', label: 'Communities' },
                            { val: '1,200+', label: 'Founders' },
                            { val: '50hrs', label: 'Saved per distribute' },
                        ].map(s => (
                            <div key={s.val} className="flex flex-col items-center bg-slate-50 border border-slate-100 px-6 py-3 rounded-2xl">
                                <span className="text-2xl font-black text-slate-900">{s.val}</span>
                                <span className="text-xs font-medium text-slate-500 mt-0.5">{s.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Platform Ticker ── */}
            <div className="border-y border-slate-100 bg-slate-50 py-4 overflow-hidden">
                <div className="flex items-center gap-2 mb-1">
                    <p className="text-[10px] font-bold tracking-widest text-slate-400 uppercase text-center w-full mb-0">
                        Submit to platforms like
                    </p>
                </div>
                <div className="relative flex overflow-x-hidden">
                    <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap">
                        {PLATFORMS.map((p, i) => (
                            <span key={i} className="mx-6 text-sm font-semibold text-slate-400">
                                {p} <span className="text-slate-200 ml-6">•</span>
                            </span>
                        ))}
                    </div>
                    <div className="flex animate-[marquee_30s_linear_infinite] whitespace-nowrap absolute left-full">
                        {PLATFORMS.map((p, i) => (
                            <span key={i} className="mx-6 text-sm font-semibold text-slate-400">
                                {p} <span className="text-slate-200 ml-6">•</span>
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── How It Works ── */}
            <section id="how-it-works" className="bg-slate-50 py-24 px-5 md:px-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-3 block">How it works</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                            Go from zero to visibility<br />in three steps.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
                        {/* Connector line */}
                        <div className="hidden md:block absolute top-14 left-[calc(16.6%+2rem)] right-[calc(16.6%+2rem)] h-[2px] bg-gradient-to-r from-blue-200 via-emerald-200 to-purple-200 z-0" />

                        {STEPS.map((step, i) => (
                            <div key={i} className="relative z-10 bg-white rounded-2xl border border-slate-100 shadow-sm p-8 flex flex-col gap-4">
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white text-sm font-black shadow-lg`}>
                                    {step.num}
                                </div>
                                <h3 className="text-lg font-bold text-slate-900">{step.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{step.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features ── */}
            <section className="bg-white py-24 px-5 md:px-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-16">
                        <span className="text-xs font-bold tracking-widest text-blue-600 uppercase mb-3 block">Everything you need</span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                            Your complete distribute toolkit.
                        </h2>
                        <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto">
                            Every tool a founder needs to distribute, track, and grow — without switching between 10 different apps.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="group border border-slate-100 rounded-2xl p-7 hover:border-blue-100 hover:shadow-md hover:shadow-blue-50 transition-all duration-300">
                                <div className={`w-11 h-11 rounded-xl ${f.color} flex items-center justify-center mb-5`}>
                                    <f.icon className="w-5 h-5" />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-2">{f.title}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">{f.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Testimonials ── */}
            <section className="bg-slate-50 py-24 px-5 md:px-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <div className="flex items-center justify-center gap-1 mb-3">
                            {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                            ))}
                            <span className="ml-2 text-sm font-bold text-slate-700">4.9 / 5</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                            What founders are saying.
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {TESTIMONIALS.map((t, i) => (
                            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-sm shadow`}>
                                            {t.initials}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 text-sm leading-none">{t.name}</p>
                                            <p className="text-slate-400 text-xs mt-0.5">{t.handle}</p>
                                        </div>
                                    </div>
                                    {X_ICON}
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed flex-1">{t.text}</p>
                                <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-50">
                                    <span>❤️ {t.likes}</span>
                                    <span>🔁 {t.reposts}</span>
                                    <span className="ml-auto">{t.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Final CTA Band ── */}
            <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 px-5 md:px-10 text-center relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-0 right-1/3 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-3xl" />
                </div>
                <div className="max-w-3xl mx-auto relative z-10">
                    <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/10 text-white/80 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6">
                        <Zap className="w-3.5 h-3.5 text-amber-400" /> Start distributing in minutes
                    </span>
                    <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight mb-6">
                        Ready to get your<br />first 100 users?
                    </h2>
                    <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
                        Join 1,200+ founders who've already distributed their products across the web. No credit card needed.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a href="/discover" className="inline-flex items-center gap-2 bg-white hover:bg-slate-100 text-slate-900 font-bold text-base px-8 py-3.5 rounded-xl shadow-2xl transition-all active:scale-[0.98]">
                            Start for free <ArrowRight className="w-4 h-4" />
                        </a>
                        {!user && (
                            <button onClick={openAuthModal} className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-base px-8 py-3.5 rounded-xl border border-white/10 transition-all">
                                Create account
                            </button>
                        )}
                    </div>
                </div>
            </section>

            {/* ── Pricing ── */}
            <section id="pricing" className="relative w-full bg-slate-900 py-24 px-5 md:px-12 overflow-hidden">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-1/4 left-1/4 w-[30rem] h-[30rem] bg-emerald-500/10 rounded-full blur-[100px]" />
                </div>
                <div className="max-w-6xl mx-auto relative z-10 text-center">
                    <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-4 block">Pricing</span>
                    <h2 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
                        Simple, transparent pricing.
                    </h2>
                    <p className="text-slate-400 text-lg max-w-xl mx-auto mb-16">
                        Pick a plan and start reaching more people today. Upgrade or cancel any time.
                    </p>
                    <PricingCards />
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-slate-950 text-slate-500 py-10 px-5 md:px-12 text-center text-sm border-t border-white/5">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <div className="grid grid-cols-2 gap-[3px]">
                        <div className="w-2 h-2 bg-blue-500 rounded-full" />
                        <div className="w-2 h-2 bg-slate-500 rounded-full" />
                        <div className="w-2 h-2 bg-slate-500 rounded-full" />
                        <div className="w-2 h-2 bg-slate-500 rounded-full" />
                    </div>
                    <span className="font-bold text-white">Distro<span className="text-blue-500">Hub</span></span>
                </div>
                <p className="text-slate-600 text-xs">© 2025 DistroHub. Built for founders who ship.</p>
            </footer>

            {/* Marquee keyframe */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-100%); }
                }
            `}</style>
        </div>
    );
}
