import { Metadata } from 'next';
import { getPlatformsByTypeAndFilter } from '@/lib/pseo/platforms';
import { WebPageSchema, ItemListSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import PlatformCard from '@/components/pseo/PlatformCard';
import Pagination from '@/components/pseo/Pagination';
import { SITE_URL, ITEMS_PER_PAGE, ISR_REVALIDATE } from '@/lib/pseo/constants';

export const revalidate = ISR_REVALIDATE;

export const metadata: Metadata = {
    title: 'Best Startup Telegram Groups to Join | DistriBurst',
    description: 'Join the best Telegram groups for startups, SaaS founders, and indie hackers. Curated list of active Telegram communities.',
    alternates: { canonical: `${SITE_URL}/startup-telegram-groups` },
};

export default async function TelegramGroupsPage({ params }: { params: { page?: string[] } }) {
    const currentPage = params.page ? parseInt(params.page[0]) || 1 : 1;
    const all = await getPlatformsByTypeAndFilter('group', 'telegram');
    const totalPages = Math.ceil(all.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const platforms = all.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    return (
        <>
            <WebPageSchema title="Startup Telegram Groups" description="Best Telegram groups for startups." url="/startup-telegram-groups" />
            <ItemListSchema items={platforms.map((p, i) => ({ name: p.name, url: `/platform/${p.slug}`, position: startIdx + i + 1 }))} name="Startup Telegram Groups" />
            <Breadcrumb items={[{ label: 'Telegram Groups', href: '/startup-telegram-groups' }]} />
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Startup Telegram Groups</span>
            </h1>
            <p className="text-gray-400 mb-8 max-w-2xl">Join the best Telegram groups for startups, SaaS founders, and indie hackers.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((p) => (<PlatformCard key={p.slug} platform={p} />))}
            </div>
            {platforms.length === 0 && <div className="glass rounded-xl p-8 text-center"><p className="text-gray-400">No Telegram groups found yet.</p></div>}
            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/startup-telegram-groups" />
        </>
    );
}
