import { Metadata } from 'next';
import { getAllTags } from '@/lib/pseo/platforms';
import { SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import { WebPageSchema } from '@/components/pseo/StructuredData';

export const revalidate = ISR_REVALIDATE;

export const metadata: Metadata = {
    title: 'Browse Startup Platforms by Tag | DistriBurst',
    description: 'Explore all platform tags to find niche communities and directories for your startup.',
    alternates: { canonical: `${SITE_URL}/tag` }
};

export default async function TagHubPage() {
    const tags = await getAllTags();

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <WebPageSchema
                title="Browse by Tag"
                description="Discover platforms organized by specific niche tags."
                url="/tag"
            />

            <Breadcrumb items={[{ label: 'Tags', href: '/tag' }]} />

            <h1 className="text-4xl font-bold text-white mb-6">
                Browse by{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Tag
                </span>
            </h1>
            <p className="text-gray-400 mb-12 max-w-2xl text-lg">
                Looking for something specific? Browse all {tags.length} tags used across
                the DistriBurst ecosystem.
            </p>

            <div className="flex flex-wrap gap-3">
                {tags.map((tag) => (
                    <a
                        key={tag}
                        href={`/tag/${tag.toLowerCase()}`}
                        className="px-4 py-2 rounded-xl glass border border-white/5 hover:border-purple-500/30 hover:text-white text-gray-400 transition-all text-sm relative z-10"
                    >
                        #{tag}
                    </a>
                ))}
            </div>
        </div>
    );
}
