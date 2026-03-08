import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPlatforms, getPlatformBySlug } from '@/lib/pseo/platforms';
import { generateComparisonPairs, parseComparisonSlug } from '@/lib/pseo/comparisons';
import { WebPageSchema, FAQSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import ComparisonTable from '@/components/pseo/ComparisonTable';
import CTAButton from '@/components/pseo/CTAButton';
import { SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';

export const revalidate = ISR_REVALIDATE;

export async function generateStaticParams() {
    const platforms = await getAllPlatforms();
    const pairs = generateComparisonPairs(platforms);
    return pairs.map((p) => ({ slugs: p.combinedSlug }));
}

export async function generateMetadata({ params }: { params: { slugs: string } }): Promise<Metadata> {
    const parsed = parseComparisonSlug(params.slugs);
    if (!parsed) return { title: 'Comparison Not Found' };

    const [a, b] = await Promise.all([
        getPlatformBySlug(parsed.slugA),
        getPlatformBySlug(parsed.slugB),
    ]);
    if (!a || !b) return { title: 'Comparison Not Found' };

    return {
        title: `${a.name} vs ${b.name} — Which Is Better? | DistriBurst`,
        description: `Compare ${a.name} and ${b.name} side-by-side. See which platform is better for your startup based on DA, pricing, backlinks, and ease of submission.`,
        alternates: { canonical: `${SITE_URL}/compare/${params.slugs}` },
        openGraph: {
            title: `${a.name} vs ${b.name}`,
            description: `Side-by-side comparison of ${a.name} and ${b.name}.`,
            url: `${SITE_URL}/compare/${params.slugs}`,
        },
    };
}

export default async function ComparisonPage({ params }: { params: { slugs: string } }) {
    const parsed = parseComparisonSlug(params.slugs);
    if (!parsed) notFound();

    const [platformA, platformB] = await Promise.all([
        getPlatformBySlug(parsed.slugA),
        getPlatformBySlug(parsed.slugB),
    ]);

    if (!platformA || !platformB) notFound();

    const faqs = [
        {
            question: `What is the difference between ${platformA.name} and ${platformB.name}?`,
            answer: `${platformA.name} is a ${platformA.type} focused on ${platformA.category || 'startups'} with DA ${platformA.domainAuthority}. ${platformB.name} is a ${platformB.type} focused on ${platformB.category || 'startups'} with DA ${platformB.domainAuthority}.`,
        },
        {
            question: `Which is better, ${platformA.name} or ${platformB.name}?`,
            answer: `It depends on your needs. ${platformA.name} offers ${platformA.backlinkType} backlinks with ${platformA.pricing || 'unknown'} pricing. ${platformB.name} offers ${platformB.backlinkType} backlinks with ${platformB.pricing || 'unknown'} pricing. Compare their features in the table above.`,
        },
        {
            question: `Can I submit to both ${platformA.name} and ${platformB.name}?`,
            answer: `Yes! We recommend submitting your startup to both platforms to maximize visibility and backlinks.`,
        },
    ];

    return (
        <>
            <WebPageSchema
                title={`${platformA.name} vs ${platformB.name}`}
                description={`Compare ${platformA.name} and ${platformB.name}`}
                url={`/compare/${params.slugs}`}
            />
            <FAQSchema faqs={faqs} />

            <Breadcrumb items={[
                { label: 'Comparisons', href: '/startup-directories' },
                { label: `${platformA.name} vs ${platformB.name}`, href: `/compare/${params.slugs}` },
            ]} />

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">{platformA.name}</span>
                {' '}vs{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-orange-400">{platformB.name}</span>
            </h1>
            <p className="text-gray-400 mb-8 max-w-2xl">
                A detailed comparison to help you decide which platform is better for your startup submission.
            </p>

            {/* Quick verdict */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="glass rounded-xl p-6 text-center border-purple-500/20">
                    <h3 className="text-purple-300 font-semibold text-lg mb-2">{platformA.name}</h3>
                    <p className="text-2xl font-bold text-white mb-1">DA {platformA.domainAuthority}</p>
                    <p className="text-sm text-gray-400">{platformA.pricing || 'N/A'} · {platformA.backlinkType} links</p>
                </div>
                <div className="glass rounded-xl p-6 text-center border-pink-500/20">
                    <h3 className="text-pink-300 font-semibold text-lg mb-2">{platformB.name}</h3>
                    <p className="text-2xl font-bold text-white mb-1">DA {platformB.domainAuthority}</p>
                    <p className="text-sm text-gray-400">{platformB.pricing || 'N/A'} · {platformB.backlinkType} links</p>
                </div>
            </div>

            {/* Comparison table */}
            <section className="glass rounded-xl p-6 mb-8">
                <h2 className="text-xl font-semibold text-white mb-4">Side-by-Side Comparison</h2>
                <ComparisonTable platformA={platformA} platformB={platformB} />
            </section>

            {/* Overviews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <section className="glass rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-purple-300 mb-3">About {platformA.name}</h2>
                    <p className="text-gray-300 text-sm leading-relaxed">{platformA.description}</p>
                    <div className="mt-4">
                        <a href={`/platform/${platformA.slug}`} className="text-sm text-purple-400 hover:text-purple-300 relative z-10">
                            View full profile →
                        </a>
                    </div>
                </section>
                <section className="glass rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-pink-300 mb-3">About {platformB.name}</h2>
                    <p className="text-gray-300 text-sm leading-relaxed">{platformB.description}</p>
                    <div className="mt-4">
                        <a href={`/platform/${platformB.slug}`} className="text-sm text-pink-400 hover:text-pink-300 relative z-10">
                            View full profile →
                        </a>
                    </div>
                </section>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                <CTAButton href={platformA.submissionLink} label="Start Distributing on DistriBurst" platformName={platformA.name} />
                <CTAButton href={platformB.submissionLink} label="Start Distributing on DistriBurst" platformName={platformB.name} />
            </div>

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
