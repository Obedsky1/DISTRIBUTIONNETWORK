import { Metadata } from 'next';
import { USE_CASES, SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import { WebPageSchema } from '@/components/pseo/StructuredData';

export const revalidate = ISR_REVALIDATE;

export const metadata: Metadata = {
    title: 'Promote Your Product — Distribution Use-Cases | DistriBurst',
    description: 'Find the best platforms to launch your startup, promote your SaaS, or distribute your AI tool.',
    alternates: { canonical: `${SITE_URL}/promote` }
};

export default async function PromoteHubPage() {
    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <WebPageSchema
                title="Promote Your Product"
                description="Find the right distribution strategy for your specific use-case."
                url="/promote"
            />

            <Breadcrumb items={[{ label: 'Promote', href: '/promote' }]} />

            <h1 className="text-4xl font-bold text-white mb-6">
                Distribution{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                    Use-Cases
                </span>
            </h1>
            <p className="text-gray-400 mb-12 max-w-2xl text-lg">
                Select your primary goal to find the most effective platforms for
                distributing your product and building traction.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {USE_CASES.map((uc) => (
                    <a
                        key={uc.slug}
                        href={`/promote/${uc.slug}`}
                        className="glass rounded-2xl p-8 border border-white/5 hover:border-cyan-500/30 transition-all group relative z-10"
                    >
                        <h2 className="text-2xl font-bold text-white group-hover:text-cyan-400 mb-4">
                            {uc.label}
                        </h2>
                        <p className="text-gray-400 mb-6">{uc.description}</p>
                        <div className="text-cyan-400 font-medium">View Platforms →</div>
                    </a>
                ))}
            </div>
        </div>
    );
}
