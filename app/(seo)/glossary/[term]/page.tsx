import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';
import Breadcrumb from '@/components/pseo/Breadcrumb';

export const revalidate = ISR_REVALIDATE;

const TERMS_DATA: Record<string, { term: string; definition: string; details: string }> = {
    'domain-authority': {
        term: 'Domain Authority',
        definition: 'Domain Authority (DA) is a search engine ranking score developed by Moz that predicts how likely a website is to rank in search engine result pages (SERPs).',
        details: 'DA scores range from one to 100, with higher scores corresponding to a greater likelihood of ranking. It is based on data from the Link Explorer web index and uses dozens of factors in its calculations. You can check the DA of platforms on our startup directory listings.'
    },
    'dofollow-backlink': {
        term: 'Dofollow Backlink',
        definition: 'A dofollow link is a link that search engines crawl and count as votes of confidence, passing SEO authority (link juice) to the destination site.',
        details: 'Dofollow links are crucial for increasing your Domain Authority. Most high-quality startup directories provide dofollow links to help you rank better.'
    }
};

export async function generateStaticParams() {
    return Object.keys(TERMS_DATA).map((slug) => ({ term: slug }));
}

export async function generateMetadata({ params }: { params: { term: string } }): Promise<Metadata> {
    const data = TERMS_DATA[params.term];
    if (!data) return {};
    return {
        title: `${data.term} | Glossary | DistriBurst`,
        description: data.definition,
        alternates: { canonical: `${SITE_URL}/glossary/${params.term}` }
    };
}

export default function GlossaryTermPage({ params }: { params: { term: string } }) {
    const data = TERMS_DATA[params.term];
    if (!data) notFound();

    return (
        <article className="max-w-3xl mx-auto py-12 px-4 space-y-8">
            <Breadcrumb items={[
                { label: 'Glossary', href: '/glossary' },
                { label: data.term, href: `/glossary/${params.term}` }
            ]} />

            <h1 className="text-4xl font-bold text-white">{data.term}</h1>

            <section className="glass rounded-2xl p-8 border border-purple-500/10">
                <h2 className="text-xl font-semibold text-purple-400 mb-4">What is {data.term}?</h2>
                <p className="text-gray-200 text-lg leading-relaxed mb-6">{data.definition}</p>
                <div className="h-px bg-white/5 my-6" />
                <p className="text-gray-400 leading-relaxed">{data.details}</p>
            </section>

            <section className="py-8">
                <h2 className="text-2xl font-bold text-white mb-6">Explore More</h2>
                <div className="flex flex-wrap gap-4">
                    <a href="/startup-directories" className="px-6 py-3 rounded-xl glass border border-white/10 hover:border-purple-500/30 text-white transition-all relative z-10">
                        Find Directories
                    </a>
                    <a href="/glossary" className="px-6 py-3 rounded-xl bg-white/5 text-gray-400 hover:text-white transition-all relative z-10">
                        Back to Glossary
                    </a>
                </div>
            </section>
        </article>
    );
}
