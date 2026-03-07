import { Metadata } from 'next';
import { getAllTags, getPlatformsByTag } from '@/lib/pseo/platforms';
import { WebPageSchema, ItemListSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import PlatformCard from '@/components/pseo/PlatformCard';
import Pagination from '@/components/pseo/Pagination';
import { SITE_URL, ITEMS_PER_PAGE, ISR_REVALIDATE } from '@/lib/pseo/constants';

export const revalidate = ISR_REVALIDATE;

export async function generateStaticParams() {
    const tags = await getAllTags();
    // Generate params for base tag pages (no page number)
    return tags.map((tag) => ({ tag, page: undefined }));
}

export async function generateMetadata({ params }: { params: { tag: string; page?: string[] } }): Promise<Metadata> {
    const label = params.tag.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const pageNum = params.page ? parseInt(params.page[0]) || 1 : 1;
    return {
        title: `${label} Platforms & Communities${pageNum > 1 ? ` — Page ${pageNum}` : ''} | DistriBurst`,
        description: `Discover the best ${label.toLowerCase()} platforms and communities for startups. Curated for SaaS founders and marketers.`,
        alternates: {
            canonical: pageNum === 1
                ? `${SITE_URL}/tag/${params.tag}`
                : `${SITE_URL}/tag/${params.tag}/${pageNum}`,
        },
    };
}

export default async function TagPage({ params }: { params: { tag: string; page?: string[] } }) {
    const currentPage = params.page ? parseInt(params.page[0]) || 1 : 1;
    const allTagged = await getPlatformsByTag(params.tag);
    const totalPages = Math.ceil(allTagged.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const platforms = allTagged.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    const label = params.tag.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    return (
        <>
            <WebPageSchema title={`${label} Platforms`} description={`Best ${label.toLowerCase()} platforms.`} url={`/tag/${params.tag}`} />
            <ItemListSchema items={platforms.slice(0, 20).map((p, i) => ({ name: p.name, url: `/platform/${p.slug}`, position: startIdx + i + 1 }))} name={`${label} Platforms`} />

            <Breadcrumb items={[
                { label: 'Tags', href: '/tag/startup' },
                { label, href: `/tag/${params.tag}` },
            ]} />

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-purple-400">#{label}</span>
                {' '}Platforms & Communities
            </h1>
            <p className="text-gray-400 mb-8 max-w-2xl">
                Explore all platforms tagged with &quot;{label.toLowerCase()}&quot;.
                {allTagged.length > 0 && ` Showing ${allTagged.length} results.`}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((p) => (
                    <PlatformCard key={p.slug} platform={p} />
                ))}
            </div>

            {platforms.length === 0 && (
                <div className="glass rounded-xl p-8 text-center">
                    <p className="text-gray-400">No platforms found for this tag.</p>
                </div>
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} basePath={`/tag/${params.tag}`} />
        </>
    );
}
