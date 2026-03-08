import { Metadata } from 'next';
import { getAllPlatforms } from '@/lib/pseo/platforms';
import { SITE_URL, PERSONAS, USE_CASES, CATEGORY_ROUTES, ISR_REVALIDATE } from '@/lib/pseo/constants';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import { WebPageSchema } from '@/components/pseo/StructuredData';

export const revalidate = ISR_REVALIDATE;

export const metadata: Metadata = {
    title: 'Sitemap Index — All Startup Directories & Communities | DistriBurst',
    description: 'A complete index of all 850+ startup directories, communities, and growth platforms tracked by DistriBurst.',
    alternates: { canonical: `${SITE_URL}/sitemap-index` },
    robots: { index: true, follow: true }
};

export default async function SitemapIndexPage() {
    const allPlatforms = await getAllPlatforms();

    // Grouping for density and crawlability
    const directories = allPlatforms.filter(p => p.type === 'directory');
    const communities = allPlatforms.filter(p => p.type === 'community' || p.type === 'group');

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <WebPageSchema
                title="Sitemap Index"
                description="Comprehensive index of all platforms for rapid Google indexing."
                url="/sitemap-index"
            />

            <Breadcrumb items={[{ label: 'Sitemap Index', href: '/sitemap-index' }]} />

            <header className="mb-12">
                <h1 className="text-4xl font-bold text-white mb-4 text-center">Master Index & Sitemap</h1>
                <p className="text-gray-400 text-center max-w-2xl mx-auto">
                    A high-density index of all {allPlatforms.length} platforms, categories, and resources to ensure rapid discovery and indexing.
                </p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* 1. Direct Links to Platforms */}
                <section className="lg:col-span-2 space-y-12">
                    <div>
                        <h2 className="text-2xl font-bold text-purple-400 mb-6 flex items-center gap-2">
                            📂 Startup Directories ({directories.length})
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
                            {directories.map(p => (
                                <a
                                    key={p.slug}
                                    href={`/platform/${p.slug}`}
                                    className="text-xs text-gray-400 hover:text-white transition-colors truncate relative z-10"
                                    title={p.name}
                                >
                                    {p.name}
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-pink-400 mb-6 flex items-center gap-2">
                            👥 Communities & Groups ({communities.length})
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-2">
                            {communities.map(p => (
                                <a
                                    key={p.slug}
                                    href={`/platform/${p.slug}`}
                                    className="text-xs text-gray-400 hover:text-white transition-colors truncate relative z-10"
                                    title={p.name}
                                >
                                    {p.name}
                                </a>
                            ))}
                        </div>
                    </div>
                </section>

                {/* 2. Structured Resources Hub */}
                <aside className="space-y-12">
                    <section className="glass rounded-2xl p-6 border border-white/5">
                        <h2 className="text-xl font-bold text-white mb-4">Core Categories</h2>
                        <ul className="space-y-3">
                            {Object.entries(CATEGORY_ROUTES).map(([slug, route]) => (
                                <li key={slug}>
                                    <a href={`/${slug}`} className="text-sm text-purple-400 hover:underline relative z-10">{route.title}</a>
                                </li>
                            ))}
                            <li><a href="/free-startup-directories" className="text-sm text-purple-400 hover:underline relative z-10">Free Startup Directories</a></li>
                        </ul>
                    </section>

                    <section className="glass rounded-2xl p-6 border border-white/5">
                        <h2 className="text-xl font-bold text-white mb-4">Rankings (Best Of)</h2>
                        <ul className="grid grid-cols-1 gap-2">
                            {['startup-directories', 'saas-communities', 'product-launch-platforms', 'indie-hacker-communities'].map(cat => (
                                <li key={cat}>
                                    <a href={`/best/${cat}`} className="text-sm text-gray-400 hover:text-white relative z-10">Best {cat.replace(/-/g, ' ')}</a>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="glass rounded-2xl p-6 border border-white/5">
                        <h2 className="text-xl font-bold text-white mb-4">Personas & Use-Cases</h2>
                        <ul className="space-y-3">
                            {PERSONAS.map(p => (
                                <li key={p.slug}><a href={`/for/${p.slug}`} className="text-sm text-gray-400 hover:text-white relative z-10">For {p.label}</a></li>
                            ))}
                            {USE_CASES.map(u => (
                                <li key={u.slug}><a href={`/promote/${u.slug}`} className="text-sm text-gray-400 hover:text-white relative z-10">{u.label}</a></li>
                            ))}
                        </ul>
                    </section>

                    <section className="p-6 bg-purple-500/5 rounded-2xl border border-purple-500/10">
                        <h2 className="text-xl font-bold text-white mb-4">Submission Guides</h2>
                        <p className="text-xs text-gray-500 mb-4">Step-by-step guides for every platform.</p>
                        <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {allPlatforms.slice(0, 100).map(p => (
                                <a key={p.slug} href={`/submit-to-${p.slug}`} className="block text-[10px] text-gray-500 hover:text-purple-300 py-1 border-b border-white/5 relative z-10">
                                    How to submit to {p.name}
                                </a>
                            ))}
                            <p className="text-[10px] text-gray-600 mt-2">...and 750+ more</p>
                        </div>
                    </section>
                </aside>
            </div>
        </div>
    );
}
