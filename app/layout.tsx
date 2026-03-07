import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from '@/components/AuthProvider';
import AuthModal from '@/components/auth/AuthModal';
import MobileWarningBanner from '@/components/MobileWarningBanner';
import { AppSidebarLayout } from '@/components/AppSidebarLayout';

const inter = Inter({ subsets: ['latin'] });

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: 'DistriBurst - Promote everywhere, all at once.',
    description: 'Submit to 800+ directories and communities from one dashboard. DistriBurst is the distribution engine for startup founders.',
    keywords: ['distriburst', 'startup marketing', 'distribution platform', 'saas marketing', 'find clients', 'hire developers', 'build audience', 'discord', 'reddit', 'telegram', 'founders', 'freelancers'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} bg-[#0a0a0f] text-white min-h-screen`}>
                <AuthProvider>
                    <AppSidebarLayout>
                        {children}
                    </AppSidebarLayout>
                    <AuthModal />
                    <MobileWarningBanner />
                </AuthProvider>
            </body>
        </html>
    );
}
