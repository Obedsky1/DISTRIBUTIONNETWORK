import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPlatforms, getPlatformBySlug } from '@/lib/pseo/platforms';
import { validatePlatform } from '@/lib/pseo/validation';
import { WebPageSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import CTAButton from '@/components/pseo/CTAButton';
import { SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';
import Link from 'next/link';

export const revalidate = ISR_REVALIDATE;

export async function generateStaticParams() {
    const platforms = await getAllPlatforms();
    return platforms.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const platform = await getPlatformBySlug(params.slug);
    if (!platform) return { title: 'Guide Not Found' };

    return {
        title: `How to Submit to ${platform.name} — Step-by-Step Guide | DistriBurst`,
        description: `Complete guide to submitting your startup to ${platform.name}. Requirements, step-by-step process, approval time (${platform.approval_time || 'varies'}), and tips for getting accepted.`,
        alternates: {
            canonical: `${SITE_URL}/submit-to-${platform.slug}`,
        },
        openGraph: {
            title: `How to Submit to ${platform.name}`,
            description: `Step-by-step guide for submitting to ${platform.name}.`,
            url: `${SITE_URL}/submit-to-${platform.slug}`,
            type: 'article',
        },
        twitter: {
            card: 'summary',
            title: `How to Submit to ${platform.name}`,
        },
    };
}

export default async function SubmissionGuidePage({ params }: { params: { slug: string } }) {
    const platform = await getPlatformBySlug(params.slug);
    if (!platform) notFound();

    const validation = validatePlatform(platform);
    if (!validation.isIndexable) {
        return (
            <div className="max-w-3xl mx-auto py-12">
                <meta name="robots" content="noindex,follow" />
                <h1 className="text-2xl font-bold text-white mb-4">Submission Guide</h1>
                <p className="text-gray-400">This guide is currently being prepared. Check back soon.</p>
            </div>
        );
    }

    return (
        <>
            <WebPageSchema
                title={`How to Submit to ${platform.name}`}
                description={`Complete submission guide for ${platform.name}`}
                url={`/submit-to-${platform.slug}`}
            />

            <div className="max-w-3xl mx-auto">
                <Breadcrumb
                    items={[
                        { label: 'Submission Guides', href: '/startup-directories' },
                        { label: platform.name, href: `/submit-to-${platform.slug}` },
                    ]}
                />

                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                    How to Submit to{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                        {platform.name}
                    </span>
                </h1>
                <p className="text-gray-400 mb-8">
                    A complete step-by-step guide for getting your startup listed on {platform.name}.
                </p>

                {/* Quick stats bar */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
                    <StatCard label="Pricing" value={platform.pricing || 'N/A'} icon="💰" />
                    <StatCard label="Approval" value={platform.approval_time || 'Varies'} icon="⏱" />
                    <StatCard label="DA Score" value={String(platform.domainAuthority || '-')} icon="📊" />
                    <StatCard label="Backlinks" value={platform.backlinkType || 'None'} icon="🔗" />
                </div>

                {/* Requirements */}
                {platform.requirements && platform.requirements.length > 0 && (
                    <section className="glass rounded-xl p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-purple-400">📋</span> What You Need Before Submitting
                        </h2>
                        <div className="grid gap-3">
                            {platform.requirements.map((req, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03]">
                                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs flex items-center justify-center flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="text-gray-300 capitalize">{req}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Step-by-step */}
                {platform.submission_steps && platform.submission_steps.length > 0 && (
                    <section className="glass rounded-xl p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-purple-400">🚀</span> Step-by-Step Submission Process
                        </h2>
                        <div className="space-y-6">
                            {platform.submission_steps.map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center text-sm font-bold">
                                            {i + 1}
                                        </span>
                                        {i < platform.submission_steps.length - 1 && (
                                            <div className="w-0.5 h-full bg-gradient-to-b from-purple-600/50 to-transparent mt-2" />
                                        )}
                                    </div>
                                    <div className="pb-6">
                                        <h3 className="text-white font-medium mb-1">Step {i + 1}</h3>
                                        <p className="text-gray-400">{step}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Approval time */}
                {platform.approval_time && (
                    <section className="glass rounded-xl p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                            <span className="text-purple-400">⏳</span> What to Expect After Submitting
                        </h2>
                        <p className="text-gray-300">
                            After completing all steps, {platform.name} typically takes{' '}
                            <strong className="text-white">{platform.approval_time}</strong> to review submissions.
                            Make sure your submission is complete and follows all guidelines to avoid delays or rejection.
                        </p>
                    </section>
                )}

                {/* Tips */}
                <section className="glass rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-purple-400">💡</span> Pro Tips for Getting Accepted
                    </h2>
                    <ul className="space-y-3">
                        <li className="text-gray-300 flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">✓</span>
                            Have a polished, professional landing page before applying.
                        </li>
                        <li className="text-gray-300 flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">✓</span>
                            Use a clear, compelling product description under 200 words.
                        </li>
                        <li className="text-gray-300 flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">✓</span>
                            Prepare high-quality screenshots or a short demo video.
                        </li>
                        {platform.rules && (
                            <li className="text-gray-300 flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">✓</span>
                                Follow {platform.name}&apos;s rules: {platform.rules}
                            </li>
                        )}
                        {platform.best_time_to_post && (
                            <li className="text-gray-300 flex items-start gap-2">
                                <span className="text-green-400 mt-0.5">✓</span>
                                Submit during the best time: {platform.best_time_to_post}.
                            </li>
                        )}
                    </ul>
                </section>

                {/* CTA */}
                <div className="text-center mb-8">
                    <CTAButton
                        href={platform.submissionLink}
                        label={`Submit to ${platform.name} Now`}
                        platformName={platform.name}
                    />
                </div>

                {/* Link to full platform page */}
                <div className="text-center">
                    <Link
                        href={`/platform/${platform.slug}`}
                        className="text-sm text-gray-400 hover:text-purple-300 transition-colors"
                    >
                        ← View full {platform.name} platform page
                    </Link>
                </div>
            </div>
        </>
    );
}

function StatCard({ label, value, icon }: { label: string; value: string; icon: string }) {
    return (
        <div className="glass rounded-xl p-4 text-center">
            <span className="text-lg">{icon}</span>
            <p className="text-white font-semibold text-sm mt-1">{value}</p>
            <p className="text-gray-500 text-xs">{label}</p>
        </div>
    );
}
