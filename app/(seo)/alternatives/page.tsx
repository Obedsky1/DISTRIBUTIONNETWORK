import { Metadata } from 'next';
import { getAllPlatforms } from '@/lib/pseo/platforms';
import { SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import { WebPageSchema } from '@/components/pseo/StructuredData';

export const revalidate = ISR_REVALIDATE;

export const metadata: Metadata = {
    title: 'Platform Alternatives Hub | DistriBurst',
    description: 'Find and compare the best alternatives to popular startup directories and communities.',
    alternates: { canonical: `${SITE_URL}/alternatives` }
};

export default async function AlternativesHubPage() {
    const allPlatforms = await getAllPlatforms();
    // Only platforms with high DA for better hub quality
    const featuredPlatforms = allPlatforms
        .filter(p => (p.domainAuthority || 0) >= 40)
        .sort((a, b) => (b.domainAuthority || 0) - (a.domainAuthority || 0))
        .slice(0, 48);

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <WebPageSchema
                title="Platform Alternatives"
                description="Find the best alternatives to popular directories and communities."
                url="/alternatives"
            />

            <Breadcrumb items={[{ label: 'Alternatives', href: '/alternatives' }]} />

            <h1 className="text-4xl font-bold text-white mb-6">
                Platform{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Alternatives
                </span>
            </h1>
            <p className="text-gray-400 mb-12 max-w-2xl text-lg">
                Searching for something similar to your favorite platform?
                Browse alternatives for the top startup directories and communities.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {featuredPlatforms.map((p) => (
                    <a
                        key={p.slug}
                        href={`/alternatives/${p.slug}`}
                        className="p-4 rounded-xl glass border border-white/5 hover:border-purple-500/30 transition-all group relative z-10"
                    >
                        <h2 className="text-sm font-bold text-white group-hover:text-purple-400 truncate">
                            {p.name} Alternatives
                        </h2>
                    </a>
                ))}
            </div>

            <div className="mt-12 p-8 glass rounded-2xl text-center border border-white/5">
                <h3 className="text-xl font-bold text-white mb-2">Can't find a specific platform?</h3>
                <p className="text-gray-400 mb-6 font-sm">Explore our master index for all 850+ tracked platforms.</p>
                <a href="/sitemap-index" className="px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-medium hover:opacity-90 transition-all relative z-10">
                    Browse Master Index
                </a>
            </div>
        </div>
    );
}
