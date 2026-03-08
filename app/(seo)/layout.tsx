import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import { OrganizationSchema, WebSiteSchema } from '@/components/pseo/StructuredData';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'DistriBurst', // Changed from 'Community For Me' to 'DistriBurst'
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
                        <a href="/" className="flex items-center gap-2 relative z-50">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
                                <span className="text-white font-bold text-sm">C</span>
                            </div>
                            <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                DistriBurst
                            </span>
                        </a>
                        <nav className="hidden md:flex items-center gap-6 text-sm">
                            <a href="/startup-directories" className="text-gray-400 hover:text-white transition-colors relative z-10">
                                Directories
                            </a>
                            <a href="/startup-communities" className="text-gray-400 hover:text-white transition-colors relative z-10">
                                Communities
                            </a>
                            <a href="/best/startup-directories" className="text-gray-400 hover:text-white transition-colors relative z-10">
                                Best Of
                            </a>
                            <a
                                href="/"
                                className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium hover:opacity-90 transition-opacity relative z-10"
                            >
                                Get Started
                            </a>
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
                                <li><a href="/startup-directories" className="text-sm text-gray-400 hover:text-purple-300 relative z-10">Startup Directories</a></li>
                                <li><a href="/best/startup-directories" className="text-sm text-gray-400 hover:text-purple-300 relative z-10">Best Directories</a></li>
                                <li><a href="/best/saas-communities" className="text-sm text-gray-400 hover:text-purple-300 relative z-10">Best Communities</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-4">Communities</h4>
                            <ul className="space-y-2">
                                <li><a href="/startup-communities" className="text-sm text-gray-400 hover:text-purple-300 relative z-10">Startup Communities</a></li>
                                <li><a href="/startup-telegram-groups" className="text-sm text-gray-400 hover:text-purple-300 relative z-10">Telegram Groups</a></li>
                                <li><a href="/startup-discord-groups" className="text-sm text-gray-400 hover:text-purple-300 relative z-10">Discord Groups</a></li>
                                <li><a href="/startup-slack-groups" className="text-sm text-gray-400 hover:text-purple-300 relative z-10">Slack Groups</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-4">For You</h4>
                            <ul className="space-y-2">
                                <li><a href="/for/startup-founders" className="text-sm text-gray-400 hover:text-purple-300 relative z-10">Startup Founders</a></li>
                                <li><a href="/for/saas-marketers" className="text-sm text-gray-400 hover:text-purple-300 relative z-10">SaaS Marketers</a></li>
                                <li><a href="/for/indie-hackers" className="text-sm text-gray-400 hover:text-purple-300 relative z-10">Indie Hackers</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-semibold text-white mb-4">Distribute</h4>
                            <ul className="space-y-2">
                                <li><a href="/promote/startup" className="text-sm text-gray-400 hover:text-purple-300 relative z-10">Distribute Startup</a></li>
                                <li><a href="/promote/saas-product" className="text-sm text-gray-400 hover:text-purple-300 relative z-10">Distribute SaaS</a></li>
                                <li><a href="/promote/ai-tool" className="text-sm text-gray-400 hover:text-purple-300 relative z-10">Distribute AI Tool</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-white/10 mt-8 pt-8 text-center">
                        <p className="text-sm text-gray-500">
                            © {new Date().getFullYear()} DistriBurst. All rights reserved.
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
