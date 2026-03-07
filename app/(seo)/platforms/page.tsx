import { Metadata } from 'next';
import Link from 'next/link';
import { getAllPlatforms } from '@/lib/pseo/platforms';
import { WebPageSchema, ItemListSchema } from '@/components/pseo/StructuredData';
import PlatformCard from '@/components/pseo/PlatformCard';
import { SITE_URL, ISR_REVALIDATE, PERSONAS, USE_CASES } from '@/lib/pseo/constants';

export const revalidate = ISR_REVALIDATE;

export const metadata: Metadata = {
    title: 'Find the Best Startup Directories & Communities | DistriBurst',
    description: 'Discover 800+ startup directories, communities, Discord servers, Telegram groups, and Slack workspaces to promote your SaaS product, gain backlinks, and grow your audience.',
    alternates: { canonical: `${SITE_URL}/platforms` },
    openGraph: {
        title: 'Explore Startup Platforms — DistriBurst',
        description: 'Discover 800+ platforms to promote your startup.',
        url: `${SITE_URL}/platforms`,
        siteName: 'DistriBurst',
        type: 'website',
    },
};

export default async function PlatformsHubPage() {
    const allPlatforms = await getAllPlatforms();
    const topDirectories = allPlatforms
        .filter((p) => p.type === 'directory')
        .sort((a, b) => (b.domainAuthority || 0) - (a.domainAuthority || 0))
        .slice(0, 6);
    const topCommunities = allPlatforms
        .filter((p) => p.type === 'community' || p.type === 'group')
        .sort((a, b) => (b.domainAuthority || 0) - (a.domainAuthority || 0))
        .slice(0, 6);

    const totalDirs = allPlatforms.filter((p) => p.type === 'directory').length;
    const totalComms = allPlatforms.filter((p) => p.type === 'community' || p.type === 'group').length;

    return (
        <>
            <WebPageSchema title="Explore Startup Platforms" description="Discover 800+ platforms to promote your startup." url="/platforms" />
            <ItemListSchema
                items={topDirectories.slice(0, 5).map((p, i) => ({ name: p.name, url: `/platform/${p.slug}`, position: i + 1 }))}
                name="Top Startup Directories"
            />

            {/* Hero */}
            <section className="py-12 md:py-20 text-center">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                    Find the Best Platforms to{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        Promote Your Startup
                    </span>
                </h1>
                <p className="text-lg md:text-xl text-gray-400 max-w-3xl mx-auto mb-8">
                    Discover {allPlatforms.length}+ startup directories, communities, and groups.
                    Get backlinks, reach early adopters, and grow your SaaS product.
                </p>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-6 mb-10">
                    <div className="glass rounded-xl px-6 py-4 text-center">
                        <p className="text-3xl font-bold text-white">{totalDirs}</p>
                        <p className="text-sm text-gray-400">Directories</p>
                    </div>
                    <div className="glass rounded-xl px-6 py-4 text-center">
                        <p className="text-3xl font-bold text-white">{totalComms}</p>
                        <p className="text-sm text-gray-400">Communities</p>
                    </div>
                </div>

                <div className="flex flex-wrap justify-center gap-4">
                    <Link href="/startup-directories" className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-opacity">
                        Browse Directories
                    </Link>
                    <Link href="/startup-communities" className="px-6 py-3 rounded-lg glass text-gray-300 hover:text-white border border-white/10 hover:border-purple-500/30 transition-all">
                        Browse Communities
                    </Link>
                </div>
            </section>

            {/* Category shortcuts */}
            <section className="py-12">
                <h2 className="text-2xl font-bold text-white mb-6">Browse by Category</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                        { label: '📂 Startup Directories', href: '/startup-directories' },
                        { label: '👥 Communities', href: '/startup-communities' },
                        { label: '💬 Telegram Groups', href: '/startup-telegram-groups' },
                        { label: '🎮 Discord Servers', href: '/startup-discord-groups' },
                        { label: '💼 Slack Groups', href: '/startup-slack-groups' },
                        { label: '🏆 Best Directories', href: '/best/startup-directories' },
                        { label: '🏆 Best Communities', href: '/best/saas-communities' },
                        { label: '💰 Free Directories', href: '/free-startup-directories' },
                    ].map((item) => (
                        <Link key={item.href} href={item.href} className="p-4 rounded-xl glass border border-white/5 hover:border-purple-500/20 transition-all text-center">
                            <span className="text-sm text-gray-300">{item.label}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Top directories */}
            <section className="py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Top Startup Directories</h2>
                    <Link href="/startup-directories" className="text-sm text-purple-400 hover:text-purple-300">View all →</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topDirectories.map((p) => (<PlatformCard key={p.slug} platform={p} />))}
                </div>
            </section>

            {/* Top communities */}
            <section className="py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-white">Top Communities & Groups</h2>
                    <Link href="/startup-communities" className="text-sm text-purple-400 hover:text-purple-300">View all →</Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {topCommunities.map((p) => (<PlatformCard key={p.slug} platform={p} />))}
                </div>
            </section>

            {/* For You */}
            <section className="py-12">
                <h2 className="text-2xl font-bold text-white mb-6">Find Platforms For You</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {PERSONAS.map((persona) => (
                        <Link key={persona.slug} href={`/for/${persona.slug}`} className="glass rounded-xl p-6 border border-white/5 hover:border-purple-500/20 transition-all">
                            <h3 className="text-lg font-semibold text-white mb-2">{persona.label}</h3>
                            <p className="text-sm text-gray-400">{persona.description}</p>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Promote */}
            <section className="py-12">
                <h2 className="text-2xl font-bold text-white mb-6">Promote Your Product</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {USE_CASES.map((uc) => (
                        <Link key={uc.slug} href={`/promote/${uc.slug}`} className="glass rounded-xl p-6 border border-white/5 hover:border-cyan-500/20 transition-all">
                            <h3 className="text-lg font-semibold text-white mb-2">{uc.label}</h3>
                            <p className="text-sm text-gray-400">{uc.description}</p>
                        </Link>
                    ))}
                </div>
            </section>
        </>
    );
}
