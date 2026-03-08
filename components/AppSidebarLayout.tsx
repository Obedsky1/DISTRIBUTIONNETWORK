'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

// SEO route prefixes — these pages are public and must NOT show the app sidebar
const SEO_ROUTES = [
    '/platform/',
    '/community/',
    '/platforms',
    '/submit-to-',
    '/startup-directories',
    '/startup-communities',
    '/startup-telegram-groups',
    '/startup-discord-groups',
    '/startup-slack-groups',
    '/best/',
    '/compare/',
    '/for/',
    '/promote/',
    '/locations/',
    '/tag/',
    '/alternatives/',
    '/free-startup-directories',
    '/glossary',
    '/about',
    '/contact',
    '/privacy',
    '/terms',
];

function isSEORoute(pathname: string): boolean {
    return SEO_ROUTES.some((prefix) => pathname.startsWith(prefix));
}

export function AppSidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    // SEO pages and homepage: render children without sidebar
    if (isHomePage || isSEORoute(pathname)) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-[#0a0a0f] font-sans text-white">
            <Sidebar />
            <main className="flex-1 relative min-h-screen md:pt-0 pt-16">
                {children}
            </main>
        </div>
    );
}
