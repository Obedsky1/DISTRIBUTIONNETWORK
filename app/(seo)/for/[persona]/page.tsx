import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPlatformsByAudience } from '@/lib/pseo/platforms';
import { WebPageSchema, ItemListSchema, FAQSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import PlatformCard from '@/components/pseo/PlatformCard';
import { SITE_URL, PERSONAS, ISR_REVALIDATE } from '@/lib/pseo/constants';

export const revalidate = ISR_REVALIDATE;

export async function generateStaticParams() {
    return PERSONAS.map((p) => ({ persona: p.slug }));
}

export async function generateMetadata({ params }: { params: { persona: string } }): Promise<Metadata> {
    const persona = PERSONAS.find((p) => p.slug === params.persona);
    if (!persona) return { title: 'Not Found' };

    return {
        title: `Best Platforms for ${persona.label} | DistriBurst`,
        description: persona.description,
        alternates: { canonical: `${SITE_URL}/for/${persona.slug}` },
        openGraph: {
            title: `Best Platforms for ${persona.label}`,
            description: persona.description,
            url: `${SITE_URL}/for/${persona.slug}`,
        },
    };
}

export default async function PersonaPage({ params }: { params: { persona: string } }) {
    const persona = PERSONAS.find((p) => p.slug === params.persona);
    if (!persona) notFound();

    const platforms = await getPlatformsByAudience(persona.audienceMatch);

    return (
        <>
            <WebPageSchema title={`Best Platforms for ${persona.label}`} description={persona.description} url={`/for/${persona.slug}`} />
            <ItemListSchema items={platforms.slice(0, 20).map((p, i) => ({ name: p.name, url: `/platform/${p.slug}`, position: i + 1 }))} name={`Best for ${persona.label}`} />
            <FAQSchema faqs={[
                {
                    question: `Which platforms are best for ${persona.label}?`,
                    answer: `For ${persona.label}, we recommend starting with ${platforms.slice(0, 3).map(p => p.name).join(', ')}. These platforms have been vetted for audience relevance and distribution impact.`
                },
                {
                    question: `Why should ${persona.label} list their projects on these directories?`,
                    answer: `Listing on curated directories helps ${persona.label} build initial traction, gain high-quality backlinks, and reach their target audience where they already hang out.`
                }
            ]} />

            <Breadcrumb items={[
                { label: 'For You', href: '/startup-directories' },
                { label: persona.label, href: `/for/${persona.slug}` },
            ]} />

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                Best Platforms for{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                    {persona.label}
                </span>
            </h1>
            <p className="text-gray-400 mb-8 max-w-2xl">{persona.description}</p>

            {/* Persona tips */}
            <div className="glass rounded-xl p-6 mb-8">
                <h2 className="text-lg font-semibold text-white mb-3">Why These Platforms?</h2>
                <p className="text-gray-300 text-sm leading-relaxed">
                    We&apos;ve selected platforms that specifically cater to {persona.label.toLowerCase()}.
                    These platforms are where your target audience hangs out, and listing your product here
                    will help you reach the right people. Each platform has been evaluated for audience fit,
                    domain authority, and ease of submission.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((p) => (
                    <PlatformCard key={p.slug} platform={p} />
                ))}
            </div>

            {platforms.length === 0 && (
                <div className="glass rounded-xl p-8 text-center">
                    <p className="text-gray-400">No platforms matched for this persona yet. Check back soon!</p>
                </div>
            )}

            {/* Cross-links */}
            <div className="mt-12 glass rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Explore More</h3>
                <div className="flex flex-wrap gap-3">
                    {PERSONAS.filter((p) => p.slug !== persona.slug).map((p) => (
                        <a key={p.slug} href={`/for/${p.slug}`} className="text-sm px-4 py-2 rounded-lg glass text-gray-400 hover:text-white hover:border-purple-500/30 transition-all relative z-10">
                            For {p.label}
                        </a>
                    ))}
                    <a href="/startup-directories" className="text-sm px-4 py-2 rounded-lg glass text-gray-400 hover:text-white hover:border-purple-500/30 transition-all relative z-10">
                        All Directories
                    </a>
                    <a href="/startup-communities" className="text-sm px-4 py-2 rounded-lg glass text-gray-400 hover:text-white hover:border-purple-500/30 transition-all relative z-10">
                        All Communities
                    </a>
                </div>
            </div>
        </>
    );
}
