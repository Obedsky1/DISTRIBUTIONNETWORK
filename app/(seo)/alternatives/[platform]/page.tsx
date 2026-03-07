import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPlatforms, getPlatformBySlug } from '@/lib/pseo/platforms';
import { WebPageSchema, ItemListSchema, FAQSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import PlatformCard from '@/components/pseo/PlatformCard';
import CTAButton from '@/components/pseo/CTAButton';
import { SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';
import Link from 'next/link';

export const revalidate = ISR_REVALIDATE;

export async function generateStaticParams() {
    const platforms = await getAllPlatforms();
    // Only generate alternatives for top platforms (DA > 40)
    return platforms
        .filter((p) => p.domainAuthority >= 40)
        .map((p) => ({ platform: p.slug }));
}

export async function generateMetadata({ params }: { params: { platform: string } }): Promise<Metadata> {
    const platform = await getPlatformBySlug(params.platform);
    if (!platform) return { title: 'Not Found' };

    return {
        title: `Best ${platform.name} Alternatives (${new Date().getFullYear()}) | Community For Me`,
        description: `Looking for alternatives to ${platform.name}? Compare the best ${platform.type === 'directory' ? 'startup directories' : 'communities'} similar to ${platform.name}. Free and paid options.`,
        alternates: { canonical: `${SITE_URL}/alternatives/${platform.slug}` },
        openGraph: {
            title: `${platform.name} Alternatives`,
            description: `Best alternatives to ${platform.name} for submitting your startup.`,
            url: `${SITE_URL}/alternatives/${platform.slug}`,
        },
    };
}

export default async function AlternativesPage({ params }: { params: { platform: string } }) {
    const platform = await getPlatformBySlug(params.platform);
    if (!platform) notFound();

    const allPlatforms = await getAllPlatforms();

    // Find alternatives: same type + similar category/tags, excluding current
    const alternatives = allPlatforms
        .filter((p) => {
            if (p.slug === platform.slug) return false;
            if (p.type !== platform.type) return false;
            // Prefer same category or overlapping tags
            const sameCategory = p.category?.toLowerCase() === platform.category?.toLowerCase();
            const sharedTags = platform.tags?.some((t) => p.tags?.includes(t));
            return sameCategory || sharedTags;
        })
        .sort((a, b) => (b.domainAuthority || 0) - (a.domainAuthority || 0))
        .slice(0, 20);

    const faqs = [
        {
            question: `What are the best alternatives to ${platform.name}?`,
            answer: `The top alternatives to ${platform.name} include ${alternatives.slice(0, 3).map((a) => a.name).join(', ')}. These platforms offer similar features for submitting and promoting your startup.`,
        },
        {
            question: `Is ${platform.name} free?`,
            answer: platform.pricing?.toLowerCase() === 'free'
                ? `Yes, ${platform.name} is free. Some alternatives also offer free listings.`
                : `${platform.name} pricing is ${platform.pricing}. There are free alternatives available.`,
        },
        {
            question: `Why look for alternatives to ${platform.name}?`,
            answer: `Submitting to multiple platforms increases your reach. While ${platform.name} is great, diversifying across similar ${platform.type === 'directory' ? 'directories' : 'communities'} maximizes backlinks and exposure.`,
        },
    ];

    return (
        <>
            <WebPageSchema
                title={`${platform.name} Alternatives`}
                description={`Best alternatives to ${platform.name}`}
                url={`/alternatives/${platform.slug}`}
            />
            <FAQSchema faqs={faqs} />
            <ItemListSchema
                items={alternatives.slice(0, 10).map((p, i) => ({ name: p.name, url: `/platform/${p.slug}`, position: i + 1 }))}
                name={`${platform.name} Alternatives`}
            />

            <Breadcrumb items={[
                { label: 'Alternatives', href: '/startup-directories' },
                { label: `${platform.name} Alternatives`, href: `/alternatives/${platform.slug}` },
            ]} />

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Best{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                    {platform.name} Alternatives
                </span>{' '}
                ({new Date().getFullYear()})
            </h1>
            <p className="text-gray-400 mb-8 max-w-2xl">
                Looking for platforms similar to {platform.name}? Here are the best alternatives
                for submitting your startup and gaining visibility.
            </p>

            {/* Original platform summary */}
            <div className="glass rounded-xl p-6 mb-8 border border-purple-500/10">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-1">About {platform.name}</h2>
                        <p className="text-sm text-gray-400 max-w-lg">{platform.description?.slice(0, 200)}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                        <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300">DA: {platform.domainAuthority}</span>
                        <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300">{platform.pricing}</span>
                        <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-300">{platform.backlinkType}</span>
                    </div>
                </div>
                <div className="mt-4">
                    <Link href={`/platform/${platform.slug}`} className="text-sm text-purple-400 hover:text-purple-300">
                        View full {platform.name} page →
                    </Link>
                </div>
            </div>

            {/* Comparison table */}
            <div className="glass rounded-xl overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-white/10">
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">#</th>
                                <th className="text-left py-3 px-4 text-gray-400 font-medium">Alternative</th>
                                <th className="text-center py-3 px-4 text-gray-400 font-medium">DA</th>
                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Pricing</th>
                                <th className="text-center py-3 px-4 text-gray-400 font-medium">Backlinks</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-white/5 bg-purple-500/5">
                                <td className="py-3 px-4 text-gray-500">—</td>
                                <td className="py-3 px-4">
                                    <Link href={`/platform/${platform.slug}`} className="text-purple-300 font-medium">
                                        {platform.name} (Original)
                                    </Link>
                                </td>
                                <td className="py-3 px-4 text-center text-white font-bold">{platform.domainAuthority}</td>
                                <td className="py-3 px-4 text-center text-gray-300">{platform.pricing}</td>
                                <td className="py-3 px-4 text-center text-gray-300">{platform.backlinkType}</td>
                            </tr>
                            {alternatives.map((alt, i) => (
                                <tr key={alt.slug} className="border-b border-white/5 hover:bg-white/[0.02]">
                                    <td className="py-3 px-4 text-gray-500">{i + 1}</td>
                                    <td className="py-3 px-4">
                                        <Link href={`/platform/${alt.slug}`} className="text-white hover:text-purple-300 font-medium">
                                            {alt.name}
                                        </Link>
                                    </td>
                                    <td className="py-3 px-4 text-center text-white">{alt.domainAuthority}</td>
                                    <td className="py-3 px-4 text-center text-gray-300">{alt.pricing}</td>
                                    <td className="py-3 px-4 text-center text-gray-300">{alt.backlinkType}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {alternatives.map((p) => (
                    <PlatformCard key={p.slug} platform={p} />
                ))}
            </div>

            {alternatives.length === 0 && (
                <div className="glass rounded-xl p-8 text-center mb-8">
                    <p className="text-gray-400">No direct alternatives found. Try browsing all directories.</p>
                    <Link href="/startup-directories" className="text-purple-400 text-sm mt-2 inline-block">
                        Browse all directories →
                    </Link>
                </div>
            )}

            {/* FAQ */}
            <section className="glass rounded-xl p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <div key={i} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
                            <h3 className="text-white font-medium mb-2">{faq.question}</h3>
                            <p className="text-gray-400 text-sm">{faq.answer}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
}
