import { Metadata } from 'next';
import { getPlatformsByTypeAndFilter } from '@/lib/pseo/platforms';
import { WebPageSchema, ItemListSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import PlatformCard from '@/components/pseo/PlatformCard';
import Pagination from '@/components/pseo/Pagination';
import { SITE_URL, ITEMS_PER_PAGE, ISR_REVALIDATE } from '@/lib/pseo/constants';

export const revalidate = ISR_REVALIDATE;

export const metadata: Metadata = {
    title: 'Best Startup Slack Groups to Join | Community For Me',
    description: 'Discover the best Slack communities for startup founders and marketers.',
    alternates: { canonical: `${SITE_URL}/startup-slack-groups` },
};

export default async function SlackGroupsPage({ params }: { params: { page?: string[] } }) {
    const currentPage = params.page ? parseInt(params.page[0]) || 1 : 1;
    const all = await getPlatformsByTypeAndFilter('group', 'slack');
    const totalPages = Math.ceil(all.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const platforms = all.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    return (
        <>
            <WebPageSchema title="Startup Slack Groups" description="Best Slack communities for startups." url="/startup-slack-groups" />
            <ItemListSchema items={platforms.map((p, i) => ({ name: p.name, url: `/platform/${p.slug}`, position: startIdx + i + 1 }))} name="Startup Slack Groups" />
            <Breadcrumb items={[{ label: 'Slack Groups', href: '/startup-slack-groups' }]} />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Startup Slack Groups</span>
            </h1>
            <p className="text-gray-400 mb-8 max-w-2xl">Discover the best Slack communities for startup founders and marketers.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((p) => (<PlatformCard key={p.slug} platform={p} />))}
            </div>
            {platforms.length === 0 && <div className="glass rounded-xl p-8 text-center"><p className="text-gray-400">No Slack groups found yet.</p></div>}
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/startup-slack-groups" />
        </>
    );
}
