import { Metadata } from 'next';
import { getPlatformsByType } from '@/lib/pseo/platforms';
import { WebPageSchema, ItemListSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import PlatformCard from '@/components/pseo/PlatformCard';
import Pagination from '@/components/pseo/Pagination';
import { SITE_URL, ITEMS_PER_PAGE, ISR_REVALIDATE } from '@/lib/pseo/constants';

export const revalidate = ISR_REVALIDATE;

export async function generateMetadata({ params }: { params: { page?: string[] } }): Promise<Metadata> {
    const pageNum = params.page ? params.page[0] : '1';
    const canonicalUrl = pageNum === '1' ? `${SITE_URL}/startup-communities` : `${SITE_URL}/startup-communities/${pageNum}`;

    return {
        title: `Best Startup Communities to Join ${pageNum !== '1' ? `(Page ${pageNum})` : ''} | DistriBurst`,
        description: 'Find active startup communities to network, get feedback, and grow your audience. Discord, Telegram, Slack, and more.',
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: 'Best Startup Communities',
            description: 'Find active startup communities to network and grow.',
            url: canonicalUrl,
        },
    };
}

export default async function StartupCommunitiesPage({ params }: { params: { page?: string[] } }) {
    const currentPage = params.page ? parseInt(params.page[0]) || 1 : 1;
    const allCommunities = await getPlatformsByType('community');
    const totalPages = Math.ceil(allCommunities.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const platforms = allCommunities.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    return (
        <>
            <WebPageSchema title="Startup Communities" description="Find active startup communities." url="/startup-communities" />
            <ItemListSchema items={platforms.map((p, i) => ({ name: p.name, url: `/platform/${p.slug}`, position: startIdx + i + 1 }))} name="Startup Communities" />
            <Breadcrumb items={[{ label: 'Startup Communities', href: '/startup-communities' }]} />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Startup Communities</span>
            </h1>
            <p className="text-gray-400 mb-8 max-w-2xl">
                Find active startup communities to network, get feedback, and grow your audience.
                {allCommunities.length > 0 && ` Showing ${allCommunities.length} communities.`}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((p) => (<PlatformCard key={p.slug} platform={p} />))}
            </div>
            {platforms.length === 0 && <div className="glass rounded-xl p-8 text-center"><p className="text-gray-400">No communities found yet.</p></div>}
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/startup-communities" />
        </>
    );
}
