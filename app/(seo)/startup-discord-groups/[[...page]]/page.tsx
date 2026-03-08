import { Metadata } from 'next';
import { getPlatformsByTypeAndFilter } from '@/lib/pseo/platforms';
import { WebPageSchema, ItemListSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import PlatformCard from '@/components/pseo/PlatformCard';
import Pagination from '@/components/pseo/Pagination';
import { SITE_URL, ITEMS_PER_PAGE, ISR_REVALIDATE } from '@/lib/pseo/constants';

export const revalidate = ISR_REVALIDATE;

export const metadata: Metadata = {
    title: 'Best Startup Discord Servers to Join | DistriBurst',
    description: 'Find the most active Discord servers for startup founders and SaaS builders.',
    alternates: { canonical: `${SITE_URL}/startup-discord-groups` },
};

export default async function DiscordGroupsPage({ params }: { params: { page?: string[] } }) {
    const currentPage = params.page ? parseInt(params.page[0]) || 1 : 1;
    const all = await getPlatformsByTypeAndFilter('group', 'discord');
    const totalPages = Math.ceil(all.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const platforms = all.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    return (
        <>
            <WebPageSchema title="Startup Discord Groups" description="Best Discord servers for startups." url="/startup-discord-groups" />
            <ItemListSchema items={platforms.map((p, i) => ({ name: p.name, url: `/platform/${p.slug}`, position: startIdx + i + 1 }))} name="Startup Discord Groups" />
            <Breadcrumb items={[{ label: 'Discord Groups', href: '/startup-discord-groups' }]} />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Startup Discord Servers</span>
            </h1>
            <p className="text-gray-400 mb-8 max-w-2xl">Find the most active Discord servers for startup founders and SaaS builders.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((p) => (<PlatformCard key={p.slug} platform={p} />))}
            </div>
            {platforms.length === 0 && <div className="glass rounded-xl p-8 text-center"><p className="text-gray-400">No Discord servers found yet.</p></div>}
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/startup-discord-groups" />
        </>
    );
}
