import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPlatforms, getPlatformBySlug } from '@/lib/pseo/platforms';
import { validatePlatform } from '@/lib/pseo/validation';
import { WebPageSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import CTAButton from '@/components/pseo/CTAButton';
import { SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';

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

                {/* Features & Benefits */}
                <section className="glass rounded-xl p-6 mb-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="text-purple-400">✨</span> Why Submit to {platform.name}?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                            <h3 className="text-white text-sm font-bold mb-1">SEO & Backlinks</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                Get a high-quality {platform.backlinkType || 'brand mention'} from a DA {platform.domainAuthority || 'trusted'} domain to boost your search rankings.
                            </p>
                        </div>
                        <div className="p-4 rounded-lg bg-white/[0.03] border border-white/5">
                            <h3 className="text-white text-sm font-bold mb-1">Early Adopter Traffic</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                Reach {platform.name}&apos;s established audience of founders and tech enthusiasts looking for new tools.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Requirements */}
                {(platform.requirements && platform.requirements.length > 0) ? (
                    <section className="glass rounded-xl p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-purple-400">📋</span> What You Need Before Submitting
                        </h2>
                        <div className="grid gap-3">
                            {platform.requirements.map((req, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
                                    <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-300 text-xs flex items-center justify-center flex-shrink-0">
                                        {i + 1}
                                    </span>
                                    <span className="text-gray-300 capitalize">{req}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : (
                    <section className="glass rounded-xl p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-purple-400">📋</span> General Requirements
                        </h2>
                        <ul className="space-y-2 text-sm text-gray-400">
                            <li>• Active, publicly accessible landing page</li>
                            <li>• Clear product name and tagline</li>
                            <li>• High-quality logo and screenshots</li>
                            <li>• Detailed product description (500+ characters)</li>
                        </ul>
                    </section>
                )}

                {/* Step-by-step */}
                {(platform.submission_steps && platform.submission_steps.length > 0) ? (
                    <section className="glass rounded-xl p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-purple-400">🚀</span> Step-by-Step Submission Process
                        </h2>
                        <div className="space-y-6">
                            {platform.submission_steps.map((step, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white flex items-center justify-center text-xs font-bold">
                                            {i + 1}
                                        </span>
                                        {i < platform.submission_steps.length - 1 && (
                                            <div className="w-0.5 h-full bg-gradient-to-b from-purple-600/50 to-transparent mt-2" />
                                        )}
                                    </div>
                                    <div className="pb-6">
                                        <h3 className="text-white font-medium mb-1 text-sm">Step {i + 1}</h3>
                                        <p className="text-gray-400 text-sm leading-relaxed">{step}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                ) : (
                    <section className="glass rounded-xl p-6 mb-6">
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-purple-400">🚀</span> How to Apply
                        </h2>
                        <p className="text-gray-400 text-sm mb-4">
                            Most submissions for {platform.name} follow a standard application flow:
                        </p>
                        <div className="space-y-3">
                            <div className="flex gap-3 text-sm">
                                <span className="text-purple-400 font-bold">1.</span>
                                <p className="text-gray-300">Navigate to the submission page using the link below.</p>
                            </div>
                            <div className="flex gap-3 text-sm">
                                <span className="text-purple-400 font-bold">2.</span>
                                <p className="text-gray-300">Create an account or sign in if required.</p>
                            </div>
                            <div className="flex gap-3 text-sm">
                                <span className="text-purple-400 font-bold">3.</span>
                                <p className="text-gray-300">Fill out your product details, ensuring all links are correct.</p>
                            </div>
                            <div className="flex gap-3 text-sm">
                                <span className="text-purple-400 font-bold">4.</span>
                                <p className="text-gray-300">Submit for review and wait for the approval period ({platform.approval_time || 'usually 2-4 weeks'}).</p>
                            </div>
                        </div>
                    </section>
                )}

                {/* Rejection Reasons & Tips */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <section className="glass rounded-xl p-6 border-red-500/10">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-red-400">⚠️</span> Common Rejection Reasons
                        </h2>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li>• Broken or poorly designed landing page</li>
                            <li>• Missing "About" or "Contact" information</li>
                            <li>• Overly promotional or "spammy" descriptions</li>
                            <li>• Submission to the wrong category</li>
                        </ul>
                    </section>
                    <section className="glass rounded-xl p-6 border-green-500/10">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <span className="text-green-400">✅</span> Submission Success Checklist
                        </h2>
                        <ul className="space-y-2 text-xs text-gray-400">
                            <li>• Tagline is benefit-driven, not feature-driven</li>
                            <li>• Screenshots show the product in action</li>
                            <li>• All external links use HTTPS</li>
                            <li>• Category selection is precise and relevant</li>
                        </ul>
                    </section>
                </div>

                {/* Approval expectation toggle */}
                {platform.approval_time && (
                    <section className="bg-white/[0.02] border border-white/5 rounded-xl p-6 mb-8 text-center">
                        <p className="text-sm text-gray-400">
                            Typical review time for {platform.name}: <strong className="text-white">{platform.approval_time}</strong>
                        </p>
                    </section>
                )}

                {/* CTA */}
                <div className="text-center mb-8">
                    <CTAButton
                        href={platform.submissionLink}
                        label="Start Distributing on DistriBurst"
                        platformName={platform.name}
                    />
                </div>

                {/* Link to full platform page */}
                <div className="text-center">
                    <a
                        href={`/platform/${platform.slug}`}
                        className="text-sm text-gray-400 hover:text-purple-300 transition-colors relative z-10"
                    >
                        ← View full {platform.name} platform page
                    </a>
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
