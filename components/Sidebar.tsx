'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, FolderCheck, Users, Megaphone, UserCircle, Settings, Crown, LogOut, Menu, X, Rocket } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { signOut } from '@/lib/firebase/auth';
import { useState } from 'react';

const NAV_ITEMS = [
    { name: 'Discover Channels', href: '/discover', icon: Compass },
    { name: 'Communities', href: '/dashboard/communities', icon: Users },
    { name: 'Directories', href: '/dashboard/directories', icon: FolderCheck },
    { name: 'Campaigns', href: '/campaign', icon: Megaphone },
    { name: 'Startup Profile', href: '/profile', icon: UserCircle },
    { name: 'Account Settings', href: '/account', icon: Settings },
    { name: 'Premium Plan', href: '/premium', icon: Crown },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, openAuthModal } = useAuthStore();
    const [isOpen, setIsOpen] = useState(false);

    if (pathname === '/') return null;

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    const toggleSidebar = () => setIsOpen(!isOpen);

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-[#080810] border-r border-white/10 w-64 text-white shadow-xl">
            <div className="h-20 flex items-center px-6 border-b border-white/5 bg-[#0a0a0f]">
                <Link href="/" className="flex items-center gap-2.5 no-underline group hover:opacity-80 transition-opacity">
                    <div className="grid grid-cols-2 gap-[4px]">
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                        <div className="w-2.5 h-2.5 bg-white/80 rounded-full" />
                        <div className="w-2.5 h-2.5 bg-white/80 rounded-full" />
                        <div className="w-2.5 h-2.5 bg-white/80 rounded-full" />
                    </div>
                    <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-50 transition-colors">
                        Distro<span className="text-indigo-500">Hub</span>
                    </span>
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
                <div className="text-[10px] font-bold tracking-widest text-white/30 uppercase mb-3 px-2">Workspace</div>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-indigo-500/15 text-indigo-300 shadow-sm border border-indigo-500/20'
                                    : 'text-white/50 hover:bg-white/5 hover:text-white/90 border border-transparent'
                                }`}
                        >
                            <Icon className="w-4 h-4" />
                            {item.name}
                        </Link>
                    )
                })}
            </div>

            <div className="p-4 border-t border-white/5 bg-[#0a0a0f]">
                {user ? (
                    <div className="space-y-2">
                        <div className="flex items-center gap-3 px-2 py-2 mb-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner">
                                {user.email?.[0].toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-bold text-white truncate">{user.startup?.name || 'My Startup'}</p>
                                <p className="text-[10px] text-white/40 truncate">{user.email}</p>
                            </div>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all">
                            <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                    </div>
                ) : (
                    !loading && (
                        <button onClick={() => { openAuthModal(); setIsOpen(false); }} className="w-full flex justify-center items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/20">
                            Sign In
                        </button>
                    )
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header & Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10 z-50 flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 no-underline">
                    <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />
                    <span className="font-bold text-lg text-white">DistroHub</span>
                </Link>
                <button onClick={toggleSidebar} className="p-2 text-white/60 hover:text-white bg-white/5 rounded-lg active:scale-95 transition-all">
                    {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={toggleSidebar}
                />
            )}

            {/* Sidebar Desktop + Mobile sliding */}
            <div className={`
                fixed top-0 bottom-0 left-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                md:translate-x-0 md:w-64
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <SidebarContent />
            </div>
        </>
    );
}
