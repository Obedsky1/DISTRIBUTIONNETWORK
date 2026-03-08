import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { OrganizationSchema, WebSiteSchema } from '@/components/pseo/StructuredData';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    metadataBase: new URL('https://communityforme.com'),
    verification: {
        google: 'YOUR_GSC_VERIFICATION_CODE', // Replace with your Google Search Console verification code
    },
    other: {
        'google-adsense-account': 'ca-pub-XXXXXXXXXX', // Replace with your AdSense ID if applicable
    },
};

export default function SEOLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className={`${inter.className} min-h-screen bg-[#0a0a0f] text-white`}>
            <OrganizationSchema />
            <WebSiteSchema />

            {/* Lightweight SEO Header */}
            <header className="sticky top-0 z-50 glass-dark">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">C</span>
                            </div>
                            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                Community For Me
                            </span>
                        </Link>
                        <nav className="hidden md:flex items-center gap-6 text-sm">
                            <Link href="/startup-directories" className="text-gray-400 hover:text-white transition-colors">
                                Directories
                            </Link>
                            <Link href="/startup-communities" className="text-gray-400 hover:text-white transition-colors">
                                Communities
                            </Link>
                            <Link href="/best/startup-directories" className="text-gray-400 hover:text-white transition-colors">
                                Best Of
                            </Link>
                            <Link
                                href="/"
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:opacity-90 transition-opacity"
                            >
                                Get Started
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {children}
            </main>

            {/* SEO Footer */}
            <footer className="border-t border-white/10 mt-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-4">Directories</h4>
                            <ul className="space-y-2">
                                <li><Link href="/startup-directories" className="text-sm text-gray-400 hover:text-purple-300">Startup Directories</Link></li>
                                <li><Link href="/best/startup-directories" className="text-sm text-gray-400 hover:text-purple-300">Best Directories</Link></li>
                                <li><Link href="/best/saas-communities" className="text-sm text-gray-400 hover:text-purple-300">Best Communities</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-4">Communities</h4>
                            <ul className="space-y-2">
                                <li><Link href="/startup-communities" className="text-sm text-gray-400 hover:text-purple-300">Startup Communities</Link></li>
                                <li><Link href="/startup-telegram-groups" className="text-sm text-gray-400 hover:text-purple-300">Telegram Groups</Link></li>
                                <li><Link href="/startup-discord-groups" className="text-sm text-gray-400 hover:text-purple-300">Discord Groups</Link></li>
                                <li><Link href="/startup-slack-groups" className="text-sm text-gray-400 hover:text-purple-300">Slack Groups</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-4">For You</h4>
                            <ul className="space-y-2">
                                <li><Link href="/for/startup-founders" className="text-sm text-gray-400 hover:text-purple-300">Startup Founders</Link></li>
                                <li><Link href="/for/saas-marketers" className="text-sm text-gray-400 hover:text-purple-300">SaaS Marketers</Link></li>
                                <li><Link href="/for/indie-hackers" className="text-sm text-gray-400 hover:text-purple-300">Indie Hackers</Link></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-4">Distribute</h4>
                            <ul className="space-y-2">
                                <li><Link href="/promote/startup" className="text-sm text-gray-400 hover:text-purple-300">Distribute Startup</Link></li>
                                <li><Link href="/promote/saas-product" className="text-sm text-gray-400 hover:text-purple-300">Distribute SaaS</Link></li>
                                <li><Link href="/promote/ai-tool" className="text-sm text-gray-400 hover:text-purple-300">Distribute AI Tool</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 mt-8 pt-8 text-center">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} Community For Me. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Google Analytics */}
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX" />
            <script
                dangerouslySetInnerHTML={{
                    __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXXXXXXXX');
          `,
                }}
            />
        </div>
    );
}
