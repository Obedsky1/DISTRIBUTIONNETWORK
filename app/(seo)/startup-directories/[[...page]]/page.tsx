import { Metadata } from 'next';
import { getAllPlatforms, getPlatformsByType } from '@/lib/pseo/platforms';
import { WebPageSchema, ItemListSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import PlatformCard from '@/components/pseo/PlatformCard';
import Pagination from '@/components/pseo/Pagination';
import { SITE_URL, ITEMS_PER_PAGE, ISR_REVALIDATE } from '@/lib/pseo/constants';

export const revalidate = ISR_REVALIDATE;

export async function generateMetadata({ params }: { params: { page?: string[] } }): Promise<Metadata> {
    const pageNum = params.page ? params.page[0] : '1';
    const canonicalUrl = pageNum === '1' ? `${SITE_URL}/startup-directories` : `${SITE_URL}/startup-directories/${pageNum}`;

    return {
        title: `Best Startup Directories to List Your Product ${pageNum !== '1' ? `(Page ${pageNum})` : ''} | DistriBurst`,
        description: 'Discover the best startup directories to list your product, gain backlinks, and boost visibility. Curated list of 500+ directories for SaaS founders.',
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: 'Best Startup Directories',
            description: 'Discover the best startup directories to list your product.',
            url: canonicalUrl,
        },
    };
}

export default async function StartupDirectoriesPage({
    params,
}: {
    params: { page?: string[] };
}) {
    const currentPage = params.page ? parseInt(params.page[0]) || 1 : 1;
    const allDirectories = await getPlatformsByType('directory');

    const totalPages = Math.ceil(allDirectories.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const platforms = allDirectories.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    const itemListItems = platforms.map((p, i) => ({
        name: p.name,
        url: `/platform/${p.slug}`,
        position: startIdx + i + 1,
    }));

    return (
        <>
            <WebPageSchema
                title="Startup Directories"
                description="Discover the best startup directories to list your product."
                url="/startup-directories"
            />
            <ItemListSchema items={itemListItems} name="Startup Directories" />

            <ItemListSchema items={itemListItems} name="Startup Directories" />

            <Breadcrumb items={[{ label: 'Startup Directories', href: '/startup-directories' }]} />

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    Startup Directories
                </span>
            </h1>
            <p className="text-gray-400 mb-8 max-w-2xl">
                Discover the best startup directories to list your product, gain backlinks, and boost visibility.
                {allDirectories.length > 0 && ` Showing ${allDirectories.length} directories.`}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((p) => (
                    <PlatformCard key={p.slug} platform={p} />
                ))}
            </div>

            {platforms.length === 0 && (
                <div className="glass rounded-xl p-8 text-center">
                    <p className="text-gray-400">No directories found. Check back soon!</p>
                </div>
            )}

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                basePath="/startup-directories"
            />
        </>
    );
}
