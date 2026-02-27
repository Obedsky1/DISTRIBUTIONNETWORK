"use client";

import React from 'react';
import {
    Check,
    Clock
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import Link from 'next/link';

export default function ChronoTaskLanding() {
    const { user, openAuthModal } = useAuthStore();
    return (
        <div className="min-h-screen bg-[#fafafc] text-slate-900 font-sans relative overflow-x-hidden flex flex-col items-center">

            {/* Background Dot Pattern */}
            <div
                className="absolute inset-0 z-0 pointer-events-none opacity-[0.25]"
                style={{
                    backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            />

            {/* Navbar */}
            <nav className="relative z-10 w-full max-w-7xl mx-auto px-6 md:px-12 py-6 flex items-center justify-between">
                <a href="/" className="flex items-center gap-3 cursor-pointer" style={{ textDecoration: 'none' }}>
                    <div className="grid grid-cols-2 gap-[4px] opacity-90">
                        <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-slate-900 rounded-full"></div>
                    </div>
                    <span className="font-bold text-xl tracking-tight text-slate-900">Distro<span className="text-blue-500">Hub</span></span>
                </a>

                <div className="hidden md:flex items-center gap-10 text-[15px] font-medium text-slate-600">
                    <a href="/discover" className="hover:text-slate-900 transition-colors">Channels</a>
                    <a href="/dashboard/communities" className="hover:text-slate-900 transition-colors">Communities</a>
                    <a href="/dashboard/directories" className="hover:text-slate-900 transition-colors">Directories</a>
                </div>

                <div className="flex items-center gap-6 text-[15px] font-medium">
                    {user ? (
                        <Link href="/dashboard/communities" className="hidden sm:block text-slate-600 hover:text-slate-900 transition-colors">
                            Dashboard
                        </Link>
                    ) : (
                        <button onClick={openAuthModal} className="hidden sm:block text-slate-600 hover:text-slate-900 transition-colors">
                            Sign in
                        </button>
                    )}
                    <a href="/discover" className="px-5 py-2.5 rounded-full border border-slate-200 text-slate-800 hover:border-slate-300 transition-colors bg-white/50 backdrop-blur-sm shadow-sm hover:shadow-md">Get Started</a>
                </div>
            </nav>

            <main className="relative z-10 w-full max-w-7xl mx-auto px-4 md:px-12 py-16 md:py-24 mb-32">
                {/* Decorative Floating Elements Context relative to main */}
                <div className="absolute inset-0 pointer-events-none hidden lg:block">

                    {/* Top Left Sticky Note */}
                    <div className="absolute top-0 left-[2%] xl:left-[-2%] transform -rotate-3 z-0 w-64 pt-6">
                        <div className="bg-[#feee91] rounded-sm p-6 pb-12 shadow-xl shadow-yellow-900/5 relative text-left" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 85%, 90% 100%, 0 100%)' }}>
                            <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                                {/* Red Pin */}
                                <div className="w-4 h-4 bg-red-600 rounded-full shadow-sm relative z-10 flex items-center justify-center">
                                    <div className="w-1.5 h-1.5 bg-white/40 rounded-full absolute top-0.5 right-0.5" />
                                    <div className="absolute -bottom-1.5 w-[2px] h-[6px] bg-slate-400" />
                                </div>
                            </div>
                            <p className="text-slate-800 text-[17px] leading-[1.4] font-medium mt-2 drop-shadow-sm font-serif italic tracking-tight opacity-80" style={{ transform: 'rotate(-1deg)' }}>
                                Find perfect communities to launch your SaaS and grow your audience seamlessly.
                            </p>
                        </div>
                        {/* Folder behind sticky note */}
                        <div className="absolute top-8 -left-4 w-64 h-64 bg-white rounded-xl shadow-lg -z-10 rotate-12 border border-slate-100"></div>

                        {/* Checkbox Icon Floating Over Sticky Note */}
                        <div className="absolute -bottom-10 left-2 w-24 h-24 bg-gradient-to-br from-white to-slate-50 rounded-[2rem] shadow-2xl shadow-slate-300/60 flex items-center justify-center transform rotate-6 border border-white">
                            <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-2xl flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.4)]">
                                <Check className="w-7 h-7 text-white" strokeWidth={3.5} />
                            </div>
                        </div>
                    </div>

                    {/* Top Right Reminders Card */}
                    <div className="absolute -top-10 right-[5%] z-0 w-[22rem] transform rotate-3">
                        <div className="w-full h-8 bg-slate-100/50 rounded-t-3xl border-t border-l border-r border-slate-200/50 shadow-inner"></div>
                        <div className="bg-white/90 backdrop-blur-md rounded-b-3xl rounded-tr-3xl shadow-2xl shadow-slate-300/40 p-6 border border-slate-100 text-left relative z-10 -mt-2">
                            <div className="flex flex-col gap-1 mb-6">
                                <span className="font-bold text-slate-800 text-[22px] tracking-tight">Next Launch</span>
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest self-end mr-4">Product Hunt</span>
                            </div>

                            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/80">
                                <p className="font-semibold text-slate-700 text-sm mb-1.5">Submit to Product Hunt</p>
                                <p className="text-slate-400 text-xs mb-4">Prepare makers comment & images</p>
                                <div className="flex flex-col items-center">
                                    <span className="text-[10px] font-semibold text-slate-400 mb-1">Time</span>
                                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/80 text-blue-500 font-semibold text-xs border border-blue-100/50">
                                        <Clock className="w-3.5 h-3.5" strokeWidth={2.5} /> 13:00 - 13:45
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Float Clock Icon */}
                        <div className="absolute -left-12 top-16 w-20 h-20 bg-gradient-to-br from-white to-slate-50 rounded-3xl shadow-2xl shadow-slate-300/50 flex items-center justify-center transform -rotate-[15deg] border border-white z-20">
                            <div className="w-11 h-11 border-[3px] border-slate-800 rounded-full flex justify-center py-[2px] relative bg-white shadow-inner">
                                <div className="w-[3px] h-3.5 bg-slate-800 rounded-full origin-bottom rotate-45 transform active mt-[1px]"></div>
                                {/* Button on top */}
                                <div className="absolute -top-[6px] left-[50%] transform -translate-x-[50%] w-3 h-1.5 bg-slate-800 rounded-sm"></div>
                                {/* Button on side */}
                                <div className="absolute top-[2px] right-[-2px] w-1.5 h-2 bg-slate-800 rounded-sm rotate-45"></div>
                            </div>
                        </div>
                        {/* Background folder elements */}
                        <div className="absolute top-10 -right-6 w-full h-full bg-slate-100/40 rounded-3xl -z-10 rotate-6 border border-slate-200/50"></div>
                    </div>

                    {/* Bottom Left Tasks Card */}
                    <div className="absolute bottom-16 left-[8%] z-10 w-[24rem] transform -rotate-[2deg]">
                        <div className="w-48 h-10 bg-slate-100/50 rounded-t-3xl border-t border-l border-r border-slate-200/50"></div>
                        <div className="bg-white/95 backdrop-blur-md rounded-b-3xl rounded-tr-3xl shadow-2xl shadow-slate-300/40 p-7 border border-slate-100 text-left -mt-2">
                            <span className="font-bold text-slate-800 text-[20px] tracking-tight block mb-8">Recent Submissions</span>

                            <div className="space-y-8">
                                {/* Task 1 */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-red-500 text-white rounded-[6px] flex items-center justify-center text-[11px] font-bold shadow-sm">B</div>
                                            <span className="text-[15px] font-semibold text-slate-700">BetaList Submission</span>
                                        </div>
                                        {/* Avatars */}
                                        <div className="flex -space-x-2">
                                            <div className="w-7 h-7 rounded-full bg-blue-100 border-[2.5px] border-white z-10 relative overflow-hidden"><img src="https://i.pravatar.cc/100?img=11" alt="avatar" /></div>
                                            <div className="w-7 h-7 rounded-full bg-purple-100 border-[2.5px] border-white z-0 relative overflow-hidden"><img src="https://i.pravatar.cc/100?img=12" alt="avatar" /></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-400">
                                        <span className="w-12">Sep 10</span>
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="w-[100%] h-full bg-blue-500 rounded-full"></div>
                                        </div>
                                        <span className="w-8 text-right text-blue-500 font-bold">100%</span>
                                    </div>
                                </div>

                                {/* Task 2 */}
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 bg-indigo-500 text-white rounded-[6px] flex items-center justify-center text-[11px] font-bold shadow-sm">IH</div>
                                            <span className="text-[15px] font-semibold text-slate-700">Indie Hackers Post</span>
                                        </div>
                                        {/* Avatars */}
                                        <div className="flex -space-x-2">
                                            <div className="w-7 h-7 rounded-full bg-amber-100 border-[2.5px] border-white z-20 relative overflow-hidden"><img src="https://i.pravatar.cc/100?img=13" alt="avatar" /></div>
                                            <div className="w-7 h-7 rounded-full bg-green-100 border-[2.5px] border-white z-10 relative overflow-hidden"><img src="https://i.pravatar.cc/100?img=14" alt="avatar" /></div>
                                            <div className="w-7 h-7 rounded-full bg-blue-100 border-[2.5px] border-white z-0 relative overflow-hidden"><img src="https://i.pravatar.cc/100?img=15" alt="avatar" /></div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-4 text-xs font-semibold text-slate-400">
                                        <span className="w-12">Sep 18</span>
                                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="w-[60%] h-full bg-blue-500 rounded-full"></div>
                                        </div>
                                        <span className="w-8 text-right font-bold">60%</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Folder background */}
                        <div className="absolute top-6 -left-6 w-full h-full bg-slate-50/80 rounded-3xl -z-10 -rotate-[4deg] border border-slate-200/50"></div>
                    </div>

                    {/* Bottom Right Integrations */}
                    <div className="absolute bottom-20 right-[10%] xl:right-[8%] z-0 w-80 transform rotate-[4deg]">
                        <div className="w-40 h-8 bg-slate-100/50 rounded-t-3xl border-t border-l border-r border-slate-200/50"></div>
                        <div className="bg-white/95 backdrop-blur-md rounded-b-3xl rounded-tr-3xl shadow-2xl shadow-slate-300/40 p-7 border border-slate-100 text-left -mt-2">
                            <span className="font-bold text-slate-800 text-[16px] tracking-tight block mb-6">100+ Integrations</span>
                            <div className="flex items-center justify-center gap-1.5">

                                {/* Gmail 3D SVG Style */}
                                <div className="w-20 h-20 bg-gradient-to-b from-white to-slate-50 rounded-[1.3rem] shadow-xl shadow-slate-300/50 flex items-center justify-center transform -rotate-6 border border-white z-10">
                                    <svg width="40" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M22 6C22 4.9 21.1 4 20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6ZM20 6L12 11L4 6H20ZM20 18H4V8L12 13L20 8V18Z" fill="#EA4335" />
                                        <path d="M12 13L2.6 6.7C2.2 6.5 2 6.1 2 5.6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V5.6C22 6.1 21.8 6.5 21.4 6.7L12 13Z" fill="#EA4335" />
                                    </svg>
                                </div>

                                {/* Slack */}
                                <div className="w-24 h-24 bg-gradient-to-b from-white to-slate-50 rounded-3xl shadow-2xl shadow-slate-300/60 flex items-center justify-center transform scale-105 z-20 border border-white">
                                    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M8.5 2.5C9.60457 2.5 10.5 3.39543 10.5 4.5C10.5 5.60457 9.60457 6.5 8.5 6.5H4.5C3.39543 6.5 2.5 5.60457 2.5 4.5C2.5 3.39543 3.39543 2.5 4.5 2.5H8.5ZM10.5 22V10.5C10.5 9.39543 9.60457 8.5 8.5 8.5C7.39543 8.5 6.5 9.39543 6.5 10.5V22C6.5 23.1046 7.39543 24 8.5 24C9.60457 24 10.5 23.1046 10.5 22ZM21.5 8.5C22.6046 8.5 23.5 9.39543 23.5 10.5C23.5 11.6046 22.6046 12.5 21.5 12.5H15.5C14.3954 12.5 13.5 11.6046 13.5 10.5C13.5 9.39543 14.3954 8.5 15.5 8.5H21.5ZM19.5 24H15.5C14.3954 24 13.5 23.1046 13.5 22C13.5 20.8954 14.3954 20 15.5 20H19.5C20.6046 20 21.5 20.8954 21.5 22C21.5 23.1046 20.6046 24 19.5 24ZM6.5 15.5C6.5 14.3954 7.39543 13.5 8.5 13.5H15.5C16.6046 13.5 17.5 14.3954 17.5 15.5V19.5C17.5 20.6046 16.6046 21.5 15.5 21.5V15.5H6.5Z" fill="#E01E5A" />
                                        <path d="M6.5 15.5V21.5C5.39543 21.5 4.5 20.6046 4.5 19.5C4.5 18.3954 5.39543 17.5 6.5 17.5V15.5ZM15.5 13.5V6.5C15.5 5.39543 16.3954 4.5 17.5 4.5C18.6046 4.5 19.5 5.39543 19.5 6.5V13.5H15.5Z" fill="#36C5F0" />
                                        <path d="M15.5 15.5V21.5C16.6046 21.5 17.5 20.6046 17.5 19.5C17.5 18.3954 16.6046 17.5 15.5 17.5V15.5Z" fill="#2EB67D" />
                                        <path d="M15.5 13.5H21.5C22.6046 13.5 23.5 14.3954 23.5 15.5C23.5 16.6046 22.6046 17.5 21.5 17.5V13.5C21.5 12.3954 20.6046 11.5 19.5 11.5H15.5V13.5Z" fill="#ECB22E" />
                                    </svg>
                                </div>

                                {/* Calendar */}
                                <div className="w-20 h-20 bg-gradient-to-b from-white to-slate-50 rounded-[1.3rem] shadow-xl shadow-slate-300/50 flex flex-col items-center justify-center transform rotate-6 border border-white z-0 text-blue-600">
                                    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-0.5">
                                        <path d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z" fill="#4285F4" />
                                        <path d="M16 2V6M8 2V6M3 10H21" stroke="#4285F4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                                        <path d="M3 10H21V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V10Z" fill="white" />
                                        <text x="12" y="18" fill="#4285F4" fontSize="10" fontWeight="bold" textAnchor="middle">31</text>
                                    </svg>
                                </div>
                            </div>
                        </div>
                        {/* Background Folder */}
                        <div className="absolute top-8 -right-4 w-full h-full bg-slate-100/40 rounded-3xl -z-10 rotate-[8deg] border border-slate-200/50"></div>
                    </div>

                </div>

                {/* Center Content Content */}
                <div className="flex flex-col items-center text-center mt-6 lg:mt-16 z-20 relative max-w-[800px] mx-auto">
                    {/* Main Logo Floating Icon */}
                    <div className="w-[120px] h-[120px] bg-gradient-to-b from-white to-slate-50 rounded-[2rem] shadow-2xl shadow-slate-300/80 flex items-center justify-center mb-10 border border-white relative z-10 transform -rotate-2">
                        <div className="grid grid-cols-2 gap-[5px] scale-[1.8]">
                            <div className="w-3.5 h-3.5 bg-blue-500 rounded-full shadow-[inset_0_1px_3px_rgba(255,255,255,0.7)]"></div>
                            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"></div>
                            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"></div>
                            <div className="w-3.5 h-3.5 bg-slate-900 rounded-full shadow-[inset_0_1px_2px_rgba(255,255,255,0.2)]"></div>
                        </div>
                        {/* Soft glow behind the logo */}
                        <div className="absolute inset-0 bg-blue-500/5 rounded-[2rem] -z-10 blur-xl"></div>
                    </div>

                    <h1 className="text-[56px] md:text-[80px] font-bold tracking-[-0.03em] text-slate-900 leading-[1.05] mb-6 drop-shadow-sm font-sans">
                        Grow Distribute and track <br />
                        <span className="text-[#a0aab8] font-medium tracking-tight">all in one place</span>
                    </h1>

                    <p className="text-[20px] md:text-[22px] text-slate-500 mb-10 max-w-2xl font-medium tracking-tight">
                        Distribute your product to 500+ channels, discover communities, and boost your visibility instantly.
                    </p>

                    <a href="/discover" className="inline-block bg-[#2563eb] border-0 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold text-[17px] shadow-lg shadow-blue-600/25 transition-all active:scale-[0.98]">
                        Start Distributing now
                    </a>
                </div>

            </main>

            {/* Benefits Section */}
            <section className="relative w-full bg-[#6761f0] py-24 px-4 md:px-12 border-t-[3px] border-slate-900 overflow-hidden">
                {/* Decorative Starburst */}
                <div className="absolute top-0 left-0 text-cyan-300 select-none pointer-events-none -translate-x-1/2 -translate-y-1/2">
                    <svg width="200" height="200" viewBox="0 0 100 100" className="fill-current">
                        <polygon points="50,0 60,35 95,20 70,50 95,80 60,65 50,100 40,65 5,80 30,50 5,20 40,35" stroke="#0f172a" strokeWidth="4" />
                    </svg>
                </div>

                <div className="max-w-6xl mx-auto relative z-10">
                    <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-20 font-sans tracking-tight">
                        What&apos;s in store?
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                        {/* Card 1 */}
                        <div className="bg-[#f8f9fa] rounded-2xl border-[3px] border-slate-900 shadow-[6px_6px_0px_#0f172a] p-8 relative">
                            {/* Starburst icon marker */}
                            <div className="absolute -top-8 -left-4 w-20 h-20 text-cyan-400 rotate-12 drop-shadow-[4px_4px_0px_#0f172a]">
                                <svg viewBox="0 0 100 100" className="fill-current w-full h-full">
                                    <polygon points="50,5 61,28 85,18 78,41 100,55 77,65 85,88 61,78 50,100 39,78 15,88 23,65 0,55 22,41 15,18 39,28" stroke="#0f172a" strokeWidth="4" />
                                    <text x="50" y="55" textAnchor="middle" fill="#0f172a" fontSize="24" fontWeight="bold">new!</text>
                                </svg>
                            </div>
                            <p className="text-xl font-bold text-slate-800 mt-4 leading-relaxed">
                                Get <span className="text-blue-600">100% product visibility</span> over 1000+ targeted beta testers.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-[#f8f9fa] rounded-2xl border-[3px] border-slate-900 shadow-[6px_6px_0px_#0f172a] p-8 relative">
                            <div className="absolute -top-10 left-8 w-[4.5rem] h-[4.5rem] bg-[#fca5a5] rounded-full border-[3px] border-slate-900 shadow-[4px_4px_0px_#0f172a] flex items-center justify-center text-3xl">
                                🔑
                            </div>
                            <p className="text-xl font-bold text-slate-800 mt-4 leading-relaxed">
                                Unlock <span className="text-red-500">100% SEO boost</span> with over 500+ high-quality backlinks.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-[#f8f9fa] rounded-2xl border-[3px] border-slate-900 shadow-[6px_6px_0px_#0f172a] p-8 relative">
                            <div className="absolute -top-10 left-8 w-[4.5rem] h-[4.5rem] bg-[#a7f3d0] border-[3px] border-slate-900 shadow-[4px_4px_0px_#0f172a] flex items-center justify-center text-3xl" style={{ borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%' }}>
                                🚀
                            </div>
                            <p className="text-xl font-bold text-slate-800 mt-4 leading-relaxed">
                                Supercharge growth with <span className="text-emerald-600">high-converting traffic</span> from curated SaaS directories.
                            </p>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-[#f8f9fa] rounded-2xl border-[3px] border-slate-900 shadow-[6px_6px_0px_#0f172a] p-8 relative">
                            <div className="absolute -top-10 left-8 w-[4.5rem] h-[4.5rem] bg-[#fde047] rounded-full border-[3px] border-slate-900 shadow-[4px_4px_0px_#0f172a] flex items-center justify-center text-3xl">
                                🎯
                            </div>
                            <p className="text-xl font-bold text-slate-800 mt-4 leading-relaxed">
                                Reach your <span className="text-amber-600">exact target audience</span> across 500+ active niche communities.
                            </p>
                        </div>

                        {/* Card 5 */}
                        <div className="bg-[#f8f9fa] rounded-2xl border-[3px] border-slate-900 shadow-[6px_6px_0px_#0f172a] p-8 relative">
                            <div className="absolute -top-10 left-8 w-[4.5rem] h-[4.5rem] bg-[#e879f9] rounded-full border-[3px] border-slate-900 shadow-[4px_4px_0px_#0f172a] flex items-center justify-center text-3xl">
                                💡
                            </div>
                            <p className="text-xl font-bold text-slate-800 mt-4 leading-relaxed">
                                Save 50+ hours with <span className="text-purple-600">auto-generated assets</span> tailored for every single platform.
                            </p>
                        </div>

                        {/* Card 6 */}
                        <div className="bg-[#f8f9fa] rounded-2xl border-[3px] border-slate-900 shadow-[6px_6px_0px_#0f172a] p-8 relative">
                            <div className="absolute -top-10 left-8 w-[4.5rem] h-[4.5rem] bg-[#93c5fd] rounded-full border-[3px] border-slate-900 shadow-[4px_4px_0px_#0f172a] flex items-center justify-center text-3xl">
                                🤝
                            </div>
                            <p className="text-xl font-bold text-slate-800 mt-4 leading-relaxed">
                                Build <span className="text-blue-600">real momentum</span> that lasts long beyond your initial launch day hype.
                            </p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
