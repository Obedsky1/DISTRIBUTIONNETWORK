import { Metadata } from 'next';
import { SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import { WebPageSchema, FAQSchema } from '@/components/pseo/StructuredData';

export const revalidate = ISR_REVALIDATE;

export const metadata: Metadata = {
    title: 'Startup & SEO Glossary | DistriBurst',
    description: 'Learn the essential terms for startup distribution, SEO, and growth marketing. From Domain Authority to Backlinks.',
    alternates: { canonical: `${SITE_URL}/glossary` },
};

const GLOSSARY_TERMS = [
    { term: 'Domain Authority', slug: 'domain-authority', description: 'A search engine ranking score developed by Moz.' },
    { term: 'Dofollow Backlink', slug: 'dofollow-backlink', description: 'A link that passes SEO authority to the destination site.' },
    { term: 'Nofollow Backlink', slug: 'nofollow-backlink', description: 'A link that does not pass SEO authority.' },
    { term: 'SaaS', slug: 'saas', description: 'Software as a Service - a software licensing and delivery model.' },
    { term: 'Indie Hacker', slug: 'indie-hacker', description: 'Entrepreneurs who build software products without venture capital.' },
    { term: 'Startup Directory', slug: 'startup-directory', description: 'Platforms where founders can list their products for exposure and backlinks.' },
];

export default function GlossaryPage() {
    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <WebPageSchema title="Startup & SEO Glossary" description="Master the language of startup distribution and SEO." url="/glossary" />
            <FAQSchema faqs={[
                {
                    question: "What is the DistriBurst Glossary?",
                    answer: "Our glossary provides clear definitions for essential terms in startup distribution, growth marketing, and SEO to help founders navigate the platform landscape."
                },
                {
                    question: "Why is SEO important for startup distribution?",
                    answer: "SEO terms like Domain Authority and Backlinks are crucial for understanding how listing your product on directories can improve your search rankings and organic traffic."
                }
            ]} />
            <Breadcrumb items={[{ label: 'Glossary', href: '/glossary' }]} />

            <h1 className="text-4xl font-bold text-white mb-6">Glossary of Terms</h1>
            <p className="text-gray-400 mb-12 text-lg">
                Master the language of startup distribution and SEO. Click on a term to learn more.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {GLOSSARY_TERMS.map((t) => (
                    <a
                        key={t.slug}
                        href={`/glossary/${t.slug}`}
                        className="glass rounded-xl p-6 border border-white/5 hover:border-purple-500/30 transition-all group relative z-10"
                    >
                        <h2 className="text-xl font-bold text-white group-hover:text-purple-400 mb-2">{t.term}</h2>
                        <p className="text-sm text-gray-400 line-clamp-2">{t.description}</p>
                    </a>
                ))}
            </div>
        </div>
    );
}
