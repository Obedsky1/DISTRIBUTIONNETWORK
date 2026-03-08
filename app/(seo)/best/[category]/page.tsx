import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPlatforms, getPlatformsByCategory, getPlatformsByType } from '@/lib/pseo/platforms';
import { rankPlatforms, SCORE_LABELS } from '@/lib/pseo/scoring';
import { WebPageSchema, ItemListSchema, FAQSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import PlatformCard from '@/components/pseo/PlatformCard';
import { SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';
import { SEOPlatform, PlatformScore } from '@/types/platform';

export const revalidate = ISR_REVALIDATE;

export async function generateStaticParams() {
    const platforms = await getAllPlatforms();
    const categories = new Set<string>();
    platforms.forEach((p) => {
        if (p.category && typeof p.category === 'string') {
            categories.add(p.category.toLowerCase().replace(/\s+/g, '-'));
        }
    });
    // Also add type-based categories
    categories.add('startup-directories');
    categories.add('saas-communities');
    categories.add('product-launch-platforms');
    return Array.from(categories).map((c) => ({ category: c }));
}

export async function generateMetadata({ params }: { params: { category: string } }): Promise<Metadata> {
    const label = params.category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    return {
        title: `Best ${label} — Ranked & Reviewed | DistriBurst`,
        description: `Discover the best ${label} ranked by domain authority, pricing, ease of use, and more. Curated and scored for startup founders.`,
        alternates: { canonical: `${SITE_URL}/best/${params.category}` },
        openGraph: {
            title: `Best ${label}`,
            description: `Top ${label} ranked and scored.`,
            url: `${SITE_URL}/best/${params.category}`,
        },
    };
}

export default async function BestCategoryPage({ params }: { params: { category: string } }) {
    const allPlatforms = await getAllPlatforms();
    const label = params.category.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    // Filter by category slug or type
    let filtered: SEOPlatform[] = [];
    if (params.category.includes('director')) {
        filtered = allPlatforms.filter((p) => p.type === 'directory');
    } else if (params.category.includes('communit')) {
        filtered = allPlatforms.filter((p) => p.type === 'community' || p.type === 'group');
    } else if (params.category.includes('launch') || params.category.includes('product')) {
        filtered = allPlatforms.filter((p) => p.tags?.some((t) => t.includes('launch') || t.includes('product')));
    } else {
        const categoryName = params.category.replace(/-/g, ' ');
        filtered = allPlatforms.filter((p) => p.category?.toLowerCase().includes(categoryName));
    }

    if (filtered.length === 0) {
        notFound();
    }

    const ranked = rankPlatforms(filtered);

    return (
        <>
            <WebPageSchema title={`Best ${label}`} description={`Top ${label} ranked and scored.`} url={`/best/${params.category}`} />
            <ItemListSchema items={ranked.slice(0, 20).map((r, i) => ({ name: r.platform.name, url: `/platform/${r.platform.slug}`, position: i + 1 }))} name={`Best ${label}`} />
            <FAQSchema faqs={[
                {
                    question: `What are the best ${label} for startups?`,
                    answer: `The top ranked ${label} include ${ranked.slice(0, 3).map(r => r.platform.name).join(', ')}. These platforms are selected based on domain authority, ease of submission, and impact on SEO.`
                },
                {
                    question: `How do you rank these ${label}?`,
                    answer: `Platforms are scored using our proprietary algorithm that considers factors like Moz Domain Authority (DA), typical approval time, pricing, and the quality of backlinks provided.`
                }
            ]} />

            <Breadcrumb items={[
                { label: 'Best Of', href: '/best/startup-directories' },
                { label: label, href: `/best/${params.category}` },
            ]} />

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Best{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    {label}
                </span>
            </h1>
            <p className="text-gray-400 mb-4 max-w-2xl">
                Ranked by domain authority, pricing, approval speed, audience fit, and ease of submission.
            </p>

            {/* Scoring criteria legend */}
            <div className="glass rounded-xl p-4 mb-8">
                <h3 className="text-sm font-medium text-gray-300 mb-3">Scoring Criteria</h3>
                <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                    {Object.entries(SCORE_LABELS).map(([key, label]) => (
                        <span key={key}>📊 {label}</span>
                    ))}
                </div>
            </div>

            {/* Comparison summary table */}
            <div className="glass rounded-xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">#</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Platform</th>
                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Score</th>
                                <th className="text-center py-3 px-4 text-gray-400 font-medium hidden md:table-cell">DA</th>
                                <th className="text-center py-3 px-4 text-gray-400 font-medium hidden md:table-cell">Pricing</th>
                                <th className="text-center py-3 px-4 text-gray-400 font-medium hidden md:table-cell">Speed</th>
                                <th className="text-center py-3 px-4 text-gray-400 font-medium hidden lg:table-cell">Fit</th>
                                <th className="text-center py-3 px-4 text-gray-400 font-medium hidden lg:table-cell">Easy</th>
                            </tr>
                        </thead>
                        <tbody>
                            {ranked.slice(0, 20).map((r, i) => (
                                <tr key={r.platform.slug} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="py-3 px-4 text-gray-500">{i + 1}</td>
                                    <td className="py-3 px-4">
                                        <a href={`/platform/${r.platform.slug}`} className="text-white hover:text-purple-300 transition-colors font-medium">
                                            {r.platform.name}
                                        </a>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 font-bold">{r.totalScore}</span>
                                    </td>
                                    <td className="py-3 px-4 text-center text-gray-300 hidden md:table-cell">{r.breakdown.domainAuthority}</td>
                                    <td className="py-3 px-4 text-center text-gray-300 hidden md:table-cell">{r.breakdown.pricing}</td>
                                    <td className="py-3 px-4 text-center text-gray-300 hidden md:table-cell">{r.breakdown.approvalSpeed}</td>
                                    <td className="py-3 px-4 text-center text-gray-300 hidden lg:table-cell">{r.breakdown.audienceFit}</td>
                                    <td className="py-3 px-4 text-center text-gray-300 hidden lg:table-cell">{r.breakdown.difficulty}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Platform cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ranked.map((r, i) => (
                    <PlatformCard key={r.platform.slug} platform={r.platform} rank={i + 1} showScore score={r.totalScore} />
                ))}
            </div>
        </>
    );
}
