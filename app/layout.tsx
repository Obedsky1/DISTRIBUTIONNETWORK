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
    title: 'Community For Me - Find Communities to Grow Your Business',
    description: 'Find the perfect communities to promote your SaaS, land clients, hire talent, or build your personal brand. Made for builders, founders, freelancers, and agencies.',
    keywords: ['community', 'saas marketing', 'find clients', 'hire developers', 'build audience', 'discord', 'reddit', 'telegram', 'founders', 'freelancers'],
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
