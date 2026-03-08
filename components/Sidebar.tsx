'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Compass, FolderCheck, Users, Megaphone, UserCircle, Settings, Crown, LogOut, Menu, X, Rocket, Search, Globe, LayoutDashboard, Sparkles, MessageSquare, Link as LinkIcon, BarChart3, Lock, LifeBuoy } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth-store';
import { signOut } from '@/lib/firebase/auth';
import { useState, useEffect } from 'react';
import { queryDocuments } from '@/lib/firebase/firestore';

const NAV_ITEMS = [
    { name: 'Discover', href: '/discover', icon: Compass, premium: false },
    { name: 'Community Workplace', href: '/dashboard/communities', icon: Users, premium: false },
    { name: 'Distribution Workplace', href: '/dashboard/directories', icon: LayoutDashboard, premium: false },
    { name: 'Campaigns', href: '/campaign', icon: Megaphone, premium: false },
    { name: 'Distro Pipeline', href: '/profile?tab=pipeline', icon: FolderCheck, premium: false },
    { name: 'Social Listening', href: '/social-listening', icon: MessageSquare, premium: true },
    { name: 'Backlink Tracker', href: '/backlinks', icon: LinkIcon, premium: false },
    { name: 'SEO Audit', href: '/seo-audit', icon: BarChart3, premium: true, comingSoon: true },
    { name: 'Startup Profile', href: '/profile', icon: UserCircle, premium: false },
    { name: 'Account Settings', href: '/account', icon: Settings, premium: false },
    { name: 'Premium Plan', href: '/premium', icon: Crown, premium: false },
    { name: 'Support', href: 'mailto:justoneguy@gmail.com', icon: LifeBuoy, premium: false },
];

export function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const { user, loading, openAuthModal } = useAuthStore();
    const [isOpen, setIsOpen] = useState(true); // Default to open for desktop
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [savedItems, setSavedItems] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            const projectId = `default_project_${user.id}`;
            const fetchSaved = async () => {
                try {
                    const [commSubs, dirSubs] = await Promise.all([
                        queryDocuments<any>('community_submissions', [{ field: 'project_id', operator: '==', value: projectId }]),
                        queryDocuments<any>('directory_submissions', [{ field: 'project_id', operator: '==', value: projectId }])
                    ]);

                    const combined = [
                        ...(commSubs || []).map(s => ({ ...s, type: 'community' })),
                        ...(dirSubs || []).map(s => ({ ...s, type: 'directory' }))
                    ].sort((a, b) => {
                        const timeA = a.created_at?.seconds || 0;
                        const timeB = b.created_at?.seconds || 0;
                        return timeB - timeA;
                    });

                    setSavedItems(combined);
                } catch (err) {
                    console.error('Error fetching saved items:', err);
                }
            };
            fetchSaved();
        }
    }, [user]);

    if (pathname === '/') return null;

    const handleLogout = async () => {
        await signOut();
        router.push('/');
    };

    const toggleSidebar = () => setIsOpen(!isOpen);
    const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

    const SidebarContent = () => (
        <div className={`flex flex-col h-full bg-[#080810] border-r border-white/10 ${isOpen ? 'w-64' : 'w-20'} text-white shadow-xl transition-all duration-300 relative`}>
            {/* Desktop Collapse Toggle */}
            <button
                onClick={toggleSidebar}
                className="absolute -right-3 top-24 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center border border-white/10 shadow-lg text-white hover:bg-indigo-400 transition-all z-50 hidden md:flex"
            >
                {isOpen ? <X className="w-3 h-3" /> : <Menu className="w-3 h-3" />}
            </button>

            <div className={`h-20 flex items-center ${isOpen ? 'px-6' : 'justify-center'} border-b border-white/5 bg-[#0a0a0f]`}>
                <Link href="/" className="flex items-center gap-2.5 no-underline group hover:opacity-80 transition-opacity">
                    <img src="/logo.svg" alt="DistriBurst" className={`${isOpen ? 'w-8 h-8' : 'w-6 h-6'} transition-all`} />
                    {isOpen && (
                        <span className="font-bold text-xl tracking-tight text-white group-hover:text-indigo-50 transition-colors">
                            Distri<span className="text-indigo-500">Burst</span>
                        </span>
                    )}
                </Link>
            </div>

            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-hide">
                <div className={`text-[10px] font-bold tracking-widest text-white/30 uppercase mb-3 px-2 ${!isOpen && 'text-center h-4'}`}>
                    {isOpen ? 'Workspace' : '•••'}
                </div>
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.href);
                    const Icon = item.icon;

                    // Check if premium is active and hasn't expired
                    const hasPremiumAccess = user?.isPremium && (
                        !user.premiumUntil ||
                        (user.premiumUntil instanceof Date ? user.premiumUntil :
                            (typeof user.premiumUntil === 'object' && 'seconds' in user.premiumUntil) ?
                                new Date(user.premiumUntil.seconds * 1000) : new Date(user.premiumUntil)) > new Date()
                    );
                    const isLocked = item.premium && !hasPremiumAccess;

                    return (
                        <div key={item.href} className="relative group/nav">
                            <Link
                                href={isLocked ? '/pricing' : item.href}
                                onClick={() => setIsMobileOpen(false)}
                                title={!isOpen ? item.name : undefined}
                                className={`flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center'} py-2.5 rounded-xl text-sm font-medium transition-all ${isActive
                                    ? 'bg-indigo-500/15 text-indigo-300 shadow-sm border border-indigo-500/20'
                                    : isLocked
                                        ? 'text-white/20 hover:text-white/40 border border-transparent cursor-not-allowed'
                                        : 'text-white/50 hover:bg-white/5 hover:text-white/90 border border-transparent'
                                    }`}
                            >
                                <div className="relative">
                                    <Icon className="w-4 h-4" />
                                    {isLocked && (
                                        <div className="absolute -top-1.5 -right-1.5 bg-black rounded-full p-0.5">
                                            <Lock className="w-2 h-2 text-amber-500" />
                                        </div>
                                    )}
                                </div>
                                {isOpen && (
                                    <div className="flex-1 flex items-center justify-between min-w-0">
                                        <span className="truncate text-xs font-semibold">{item.name}</span>
                                        {item.comingSoon && (
                                            <span className="ml-2 px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-400 text-[8px] font-bold uppercase tracking-tighter border border-indigo-500/20 whitespace-nowrap">
                                                Soon
                                            </span>
                                        )}
                                    </div>
                                )}
                            </Link>
                        </div>
                    );
                })}

                {/* Saved Items Section */}
                {user && savedItems.length > 0 && isOpen && (
                    <div className="mt-8 px-2 animate-in fade-in duration-500">
                        <div className="flex items-center justify-between mb-3 px-2">
                            <span className="text-[10px] font-bold tracking-widest text-white/30 uppercase">Saved Targets</span>
                        </div>
                        <div className="space-y-1">
                            {savedItems.slice(0, 6).map((item) => {
                                const isComm = item.type === 'community';
                                const baseUrl = isComm ? '/dashboard/communities' : '/dashboard/directories';
                                return (
                                    <Link
                                        key={item.id}
                                        href={`${baseUrl}?subId=${item.id}`}
                                        className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/40 hover:bg-white/5 hover:text-white transition-all group border border-transparent hover:border-white/5"
                                    >
                                        <div className={`w-1.5 h-1.5 rounded-full ${isComm ? 'bg-emerald-500/40 group-hover:bg-emerald-500' : 'bg-indigo-500/40 group-hover:bg-indigo-500'} transition-colors shadow-sm`} />
                                        <span className="truncate text-[11px] font-medium">{item.directory_name}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            <div className={`mt-auto border-t border-white/5 bg-[#0a0a0f] p-4 ${!isOpen && 'flex flex-col items-center'}`}>
                {isOpen && user && !user.isPremium && (
                    <div className="mt-6 px-2 mb-6">
                        <Link
                            href="/pricing"
                            className="flex items-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl text-xs font-bold text-white shadow-lg shadow-amber-500/20 hover:scale-[1.02] transition-all"
                        >
                            <Crown className="w-3.5 h-3.5" />
                            <span>Upgrade to Pro</span>
                        </Link>
                    </div>
                )}

                {user ? (
                    <div className="space-y-2 w-full">
                        <div className={`flex items-center ${isOpen ? 'gap-3 px-2' : 'justify-center'} py-2 mb-2`}>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-inner flex-shrink-0 relative">
                                {user.email?.[0].toUpperCase() || 'U'}
                                {user.isPremium && <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-[#0a0a0f] flex items-center justify-center"><Crown className="w-1.5 h-1.5 text-black" /></div>}
                            </div>
                            {isOpen && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-white truncate">{user.startup?.name || 'My Startup'}</p>
                                    <p className="text-[10px] text-white/40 truncate">{user.email}</p>
                                </div>
                            )}
                        </div>
                        <button onClick={handleLogout} className={`w-full flex items-center ${isOpen ? 'gap-3 px-3' : 'justify-center'} py-2 rounded-xl text-sm font-medium text-white/40 hover:bg-red-500/10 hover:text-red-400 transition-all`}>
                            <LogOut className="w-4 h-4" /> {isOpen && <span className="text-xs">Sign Out</span>}
                        </button>
                    </div>
                ) : (
                    !loading && (
                        <button onClick={() => { openAuthModal(); setIsMobileOpen(false); }} className={`w-full flex justify-center items-center ${isOpen ? 'gap-2 px-4' : 'px-2'} py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-500/20`}>
                            {isOpen ? 'Sign In' : <UserCircle className="w-5 h-5" />}
                        </button>
                    )
                )}
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile Header & Hamburger */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/10 z-[70] flex items-center justify-between px-4">
                <Link href="/" className="flex items-center gap-2 no-underline">
                    <img src="/logo.svg" alt="Logo" className="w-7 h-7" />
                    <span className="font-bold text-lg text-white">DistriBurst</span>
                </Link>
                <button onClick={toggleMobileSidebar} className="p-2 text-white/60 hover:text-white bg-white/5 rounded-lg active:scale-95 transition-all">
                    {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
            </div>

            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
                    onClick={toggleMobileSidebar}
                />
            )}

            {/* Sidebar Desktop + Mobile sliding */}
            <div className={`
                fixed top-0 bottom-0 left-0 z-[70] transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)]
                ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'}
                ${isOpen ? 'md:w-64' : 'md:w-20'}
            `}>
                <SidebarContent />
            </div>

            {/* Injected Style for Main Content Margin */}
            <style jsx global>{`
                @media (min-width: 768px) {
                    main {
                        flex: 1 !important;
                        width: calc(100% - ${isOpen ? '256px' : '80px'}) !important;
                        margin-left: ${isOpen ? '256px' : '80px'} !important;
                        transition: all 0.3s ease !important;
                    }
                }
                
                /* Mobile adjustments for main content */
                @media (max-width: 767px) {
                    main {
                        padding-top: 3.5rem !important; /* height of h-14 */
                    }
                }
            `}</style>
        </>
    );
}
