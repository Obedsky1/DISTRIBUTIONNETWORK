import { Metadata } from 'next';
import { getAllPlatforms } from '@/lib/pseo/platforms';
import { WebPageSchema, ItemListSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import PlatformCard from '@/components/pseo/PlatformCard';
import Pagination from '@/components/pseo/Pagination';
import { SITE_URL, ITEMS_PER_PAGE, ISR_REVALIDATE } from '@/lib/pseo/constants';

export const revalidate = ISR_REVALIDATE;

export async function generateMetadata({ params }: { params: { page?: string[] } }): Promise<Metadata> {
    const pageNum = params.page ? params.page[0] : '1';
    const canonicalUrl = pageNum === '1' ? `${SITE_URL}/free-startup-directories` : `${SITE_URL}/free-startup-directories/${pageNum}`;

    return {
        title: `Free Startup Directories — Submit Your Product for Free ${pageNum !== '1' ? `(Page ${pageNum})` : ''} | DistriBurst`,
        description: 'Complete list of free startup directories where you can list your product, gain backlinks, and get exposure at no cost. All verified and curated.',
        alternates: { canonical: canonicalUrl },
        openGraph: {
            title: 'Free Startup Directories',
            description: 'Submit your startup to these directories for free.',
            url: canonicalUrl,
        },
    };
}

export default async function FreeDirectoriesPage({ params }: { params: { page?: string[] } }) {
    const currentPage = params.page ? parseInt(params.page[0]) || 1 : 1;
    const allPlatforms = await getAllPlatforms();

    // Filter for free directories only
    const freeDirs = allPlatforms
        .filter((p) => {
            const isFree = p.pricing?.toLowerCase() === 'free';
            const isDir = p.type === 'directory';
            return isFree && isDir;
        })
        .sort((a, b) => (b.domainAuthority || 0) - (a.domainAuthority || 0));

    const totalPages = Math.ceil(freeDirs.length / ITEMS_PER_PAGE);
    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const platforms = freeDirs.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    return (
        <>
            <WebPageSchema title="Free Startup Directories" description="Free directories to submit your startup." url="/free-startup-directories" />
            <ItemListSchema items={platforms.slice(0, 20).map((p, i) => ({ name: p.name, url: `/platform/${p.slug}`, position: startIdx + i + 1 }))} name="Free Startup Directories" />

            <Breadcrumb items={[{ label: 'Free Directories', href: '/free-startup-directories' }]} />

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-400">
                    Free Startup Directories
                </span>
            </h1>
            <p className="text-gray-400 mb-4 max-w-2xl">
                Submit your startup to these directories completely free.
                Sorted by domain authority for maximum SEO value.
                {freeDirs.length > 0 && ` Showing ${freeDirs.length} free directories.`}
            </p>

            {/* Value proposition */}
            <div className="glass rounded-xl p-6 mb-8 border border-emerald-500/10">
                <h2 className="text-lg font-semibold text-white mb-3">💡 Why Submit to Free Directories?</h2>
                <ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Get dofollow backlinks for free</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Increase domain authority</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Drive referral traffic</li>
                    <li className="flex items-start gap-2"><span className="text-emerald-400">✓</span> Reach early adopters</li>
                </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((p) => (
                    <PlatformCard key={p.slug} platform={p} />
                ))}
            </div>

            {platforms.length === 0 && (
                <div className="glass rounded-xl p-8 text-center">
                    <p className="text-gray-400">No free directories found.</p>
                </div>
            )}

            <Pagination currentPage={currentPage} totalPages={totalPages} basePath="/free-startup-directories" />
        </>
    );
}
