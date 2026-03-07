import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPlatforms } from '@/lib/pseo/platforms';
import { WebPageSchema, ItemListSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import PlatformCard from '@/components/pseo/PlatformCard';
import { SITE_URL, USE_CASES, ISR_REVALIDATE } from '@/lib/pseo/constants';

export const revalidate = ISR_REVALIDATE;

export async function generateStaticParams() {
    return USE_CASES.map((u) => ({ useCase: u.slug }));
}

export async function generateMetadata({ params }: { params: { useCase: string } }): Promise<Metadata> {
    const useCase = USE_CASES.find((u) => u.slug === params.useCase);
    if (!useCase) return { title: 'Not Found' };

    return {
        title: `${useCase.label} — Best Distribution Platforms | DistriBurst`,
        description: useCase.description,
        alternates: { canonical: `${SITE_URL}/promote/${useCase.slug}` },
        openGraph: {
            title: useCase.label,
            description: useCase.description,
            url: `${SITE_URL}/promote/${useCase.slug}`,
        },
    };
}

export default async function UseCasePage({ params }: { params: { useCase: string } }) {
    const useCase = USE_CASES.find((u) => u.slug === params.useCase);
    if (!useCase) notFound();

    const allPlatforms = await getAllPlatforms();
    const platforms = allPlatforms.filter((p) =>
        useCase.categoryMatch.some(
            (c) =>
                p.category?.toLowerCase().includes(c) ||
                p.tags?.some((t) => t.toLowerCase().includes(c)) ||
                p.description?.toLowerCase().includes(c)
        )
    );

    return (
        <>
            <WebPageSchema title={useCase.label} description={useCase.description} url={`/promote/${useCase.slug}`} />
            <ItemListSchema items={platforms.slice(0, 20).map((p, i) => ({ name: p.name, url: `/platform/${p.slug}`, position: i + 1 }))} name={useCase.label} />

            <Breadcrumb items={[
                { label: 'Promote', href: '/promote/startup' },
                { label: useCase.label, href: `/promote/${useCase.slug}` },
            ]} />

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    {useCase.label}
                </span>
            </h1>
            <p className="text-gray-400 mb-8 max-w-2xl">{useCase.description}</p>

            <div className="glass rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-3">How to Use These Platforms</h2>
                <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2"><span className="text-cyan-400">1.</span> Start with free platforms first to test your positioning and messaging.</li>
                    <li className="flex items-start gap-2"><span className="text-cyan-400">2.</span> Prioritize platforms with higher DA scores for better SEO backlinks.</li>
                    <li className="flex items-start gap-2"><span className="text-cyan-400">3.</span> Submit to 3-5 platforms per week to maintain momentum.</li>
                    <li className="flex items-start gap-2"><span className="text-cyan-400">4.</span> Track which platforms drive the most traffic and conversions.</li>
                </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((p) => (
                    <PlatformCard key={p.slug} platform={p} />
                ))}
            </div>

            {platforms.length === 0 && (
                <div className="glass rounded-xl p-8 text-center">
                    <p className="text-gray-400">No platforms matched for this use case yet.</p>
                </div>
            )}
        </>
    );
}
