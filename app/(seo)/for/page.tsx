import { Metadata } from 'next';
import { PERSONAS, SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import { WebPageSchema } from '@/components/pseo/StructuredData';

export const revalidate = ISR_REVALIDATE;

export const metadata: Metadata = {
    title: 'Startup Platforms for Every Role | DistriBurst',
    description: 'Discover the best distribution platforms tailored for startup founders, SaaS marketers, and indie hackers.',
    alternates: { canonical: `${SITE_URL}/for` }
};

export default async function ForHubPage() {
    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <WebPageSchema
                title="Startup Platforms for You"
                description="Explore directories and communities tailored to your specific role."
                url="/for"
            />

            <Breadcrumb items={[{ label: 'For You', href: '/for' }]} />

            <h1 className="text-4xl font-bold text-white mb-6">
                Platforms Tailored{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                    For You
                </span>
            </h1>
            <p className="text-gray-400 mb-12 max-w-2xl text-lg">
                Whether you're a solo indie hacker or a growth marketer at a scaling SaaS,
                we've curated the best platforms for your specific needs.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {PERSONAS.map((persona) => (
                    <a
                        key={persona.slug}
                        href={`/for/${persona.slug}`}
                        className="glass rounded-2xl p-8 border border-white/5 hover:border-orange-500/30 transition-all group relative z-10"
                    >
                        <h2 className="text-2xl font-bold text-white group-hover:text-orange-400 mb-4">
                            {persona.label}
                        </h2>
                        <p className="text-gray-400 mb-6">{persona.description}</p>
                        <div className="text-orange-500 font-medium">Explore Platforms →</div>
                    </a>
                ))}
            </div>
        </div>
    );
}
