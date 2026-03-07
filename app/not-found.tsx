import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Page Not Found | Community For Me',
    description: 'The page you are looking for does not exist. Browse our startup directories and communities.',
};

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
            <div className="text-center max-w-xl">
                <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                    404
                </div>
                <h1 className="text-2xl font-bold text-white mb-3">Page Not Found</h1>
                <p className="text-gray-400 mb-8">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    Try browsing our directories and communities instead.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    <Link
                        href="/startup-directories"
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all text-center"
                    >
                        <span className="text-2xl mb-1 block">📂</span>
                        <span className="text-sm text-gray-300">Directories</span>
                    </Link>
                    <Link
                        href="/startup-communities"
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all text-center"
                    >
                        <span className="text-2xl mb-1 block">👥</span>
                        <span className="text-sm text-gray-300">Communities</span>
                    </Link>
                    <Link
                        href="/best/startup-directories"
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all text-center"
                    >
                        <span className="text-2xl mb-1 block">🏆</span>
                        <span className="text-sm text-gray-300">Best Of</span>
                    </Link>
                    <Link
                        href="/for/startup-founders"
                        className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all text-center"
                    >
                        <span className="text-2xl mb-1 block">🚀</span>
                        <span className="text-sm text-gray-300">For Founders</span>
                    </Link>
                </div>

                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity"
                >
                    ← Back to Home
                </Link>
            </div>
        </div>
    );
}
