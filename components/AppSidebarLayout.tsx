'use client';

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';

export function AppSidebarLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isHomePage = pathname === '/';

    if (isHomePage) {
        return <>{children}</>;
    }

    return (
        <div className="flex min-h-screen bg-[#0a0a0f] font-sans text-white">
            <Sidebar />
            <main className="flex-1 md:ml-64 relative min-h-screen md:pt-0 pt-16">
                {children}
            </main>
        </div>
    );
}
