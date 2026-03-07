import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPlatforms, getPlatformBySlug, getRedirectForSlug } from '@/lib/pseo/platforms';
import { validatePlatform } from '@/lib/pseo/validation';
import { generateInternalLinks } from '@/lib/pseo/linking';
import { generatePlatformFAQs, WebPageSchema, FAQSchema, BreadcrumbListSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import CTAButton from '@/components/pseo/CTAButton';
import RelatedLinks from '@/components/pseo/RelatedLinks';
import { SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const revalidate = ISR_REVALIDATE;

// ─── Static generation ───
export async function generateStaticParams() {
    const platforms = await getAllPlatforms();
    return platforms.map((p) => ({ slug: p.slug }));
}

// ─── Dynamic metadata ───
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const platform = await getPlatformBySlug(params.slug);
    if (!platform) {
        return { title: 'Platform Not Found' };
    }

    const validation = validatePlatform(platform);

    return {
        title: `Submit Startup to ${platform.name} | SaaS Distribution Platforms`,
        description: `Learn how to submit your startup to ${platform.name}, gain backlinks, and promote your SaaS product. ${platform.pricing ? `Pricing: ${platform.pricing}.` : ''} ${platform.approval_time ? `Approval: ${platform.approval_time}.` : ''}`,
        alternates: {
            canonical: `${SITE_URL}/platform/${platform.slug}`,
        },
        robots: validation.isIndexable
            ? { index: true, follow: true }
            : { index: false, follow: true },
        openGraph: {
            title: `Submit Startup to ${platform.name}`,
            description: `Learn how to submit your startup to ${platform.name} and promote your SaaS product.`,
            url: `${SITE_URL}/platform/${platform.slug}`,
            siteName: 'DistriBurst',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `Submit Startup to ${platform.name}`,
            description: `Learn how to submit your startup to ${platform.name} and promote your SaaS product.`,
        },
    };
}

// ─── Page ───
export default async function PlatformPage({ params }: { params: { slug: string } }) {
    // Check for redirect
    const redirectSlug = await getRedirectForSlug(params.slug);
    if (redirectSlug) {
        redirect(`/platform/${redirectSlug}`);
    }

    const platform = await getPlatformBySlug(params.slug);
    if (!platform) {
        notFound();
    }

    const validation = validatePlatform(platform);

    // If exists but missing required fields: show minimal page with noindex
    if (!validation.isValid) {
        return (
            <div className="max-w-3xl mx-auto py-12">
                <meta name="robots" content="noindex,follow" />
                <h1 className="text-2xl font-bold text-white mb-4">{platform.name || 'Platform'}</h1>
                <div className="glass rounded-xl p-6">
                    <p className="text-gray-400">
                        This platform listing is currently incomplete. We are working on updating the information.
                    </p>
                </div>
            </div>
        );
    }

    const allPlatforms = await getAllPlatforms();
    const internalLinks = generateInternalLinks(platform, allPlatforms);
    const faqs = generatePlatformFAQs(platform);

    // Breadcrumb items
    const typeLabel = platform.type === 'directory' ? 'Directories' : platform.type === 'community' ? 'Communities' : 'Groups';
    const typePath = platform.type === 'directory' ? '/startup-directories' : '/startup-communities';

    return (
        <>
            <WebPageSchema
                title={`Submit Startup to ${platform.name}`}
                description={platform.description}
                url={`/platform/${platform.slug}`}
            />
            <FAQSchema faqs={faqs} />
            <BreadcrumbListSchema
                items={[
                    { name: 'Home', url: '/', position: 1 },
                    { name: typeLabel, url: typePath, position: 2 },
                    { name: platform.name, url: `/platform/${platform.slug}`, position: 3 },
                ]}
            />

            {!validation.isIndexable && (
                <meta name="robots" content="noindex,follow" />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main content */}
                <article className="lg:col-span-2 space-y-8">
                    <Breadcrumb
                        items={[
                            { label: typeLabel, href: typePath },
                            { label: platform.name, href: `/platform/${platform.slug}` },
                        ]}
                    />

                    {/* H1 */}
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Submit your startup to{' '}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                                {platform.name}
                            </span>
                        </h1>
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                            <span className="px-3 py-1 rounded-full glass text-purple-300">
                                {platform.type}
                            </span>
                            {platform.domainAuthority > 0 && (
                                <span className="px-3 py-1 rounded-full glass text-gray-300">
                                    DA: {platform.domainAuthority}
                                </span>
                            )}
                            <span className="px-3 py-1 rounded-full glass text-gray-300">
                                🔗 {platform.backlinkType}
                            </span>
                            {platform.domainAuthority > 50 && (
                                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center gap-1.5">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" /></svg>
                                    Verified
                                </span>
                            )}
                            {platform.pricing && (
                                <span className="px-3 py-1 rounded-full glass text-emerald-300">
                                    💰 {platform.pricing}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Overview */}
                    <section className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-3">Overview</h2>
                        <p className="text-gray-300 leading-relaxed">{platform.description}</p>
                    </section>

                    {/* Platform Details */}
                    <section className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Platform Details</h2>
                        <div className="grid grid-cols-2 gap-4">
                            <DetailItem label="Type" value={platform.type} />
                            <DetailItem label="Category" value={platform.category} />
                            <DetailItem label="Domain Authority" value={String(platform.domainAuthority)} />
                            <DetailItem label="Backlink Type" value={platform.backlinkType} />
                            <DetailItem label="Pricing" value={platform.pricing} />
                            <DetailItem label="Geo Focus" value={platform.geo_focus} />
                        </div>
                    </section>

                    {/* Audience */}
                    {platform.audience && (
                        <section className="glass rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-3">Audience</h2>
                            <p className="text-gray-300">
                                {platform.name} is primarily used by <strong className="text-white">{platform.audience}</strong>.
                                This makes it an excellent platform for reaching your target market if your product serves this demographic.
                            </p>
                        </section>
                    )}

                    {/* Requirements */}
                    {platform.requirements && platform.requirements.length > 0 && (
                        <section className="glass rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-3">Submission Requirements</h2>
                            <p className="text-gray-400 mb-3">Before submitting to {platform.name}, make sure you have:</p>
                            <ul className="space-y-2">
                                {platform.requirements.map((req, i) => (
                                    <li key={i} className="flex items-start gap-2 text-gray-300">
                                        <span className="text-purple-400 mt-0.5">✓</span>
                                        <span className="capitalize">{req}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    {/* Step-by-step submission */}
                    {platform.submission_steps && platform.submission_steps.length > 0 && (
                        <section className="glass rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-4">Step-by-Step Submission Process</h2>
                            <div className="space-y-4">
                                {platform.submission_steps.map((step, i) => (
                                    <div key={i} className="flex items-start gap-4">
                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/30 text-purple-300 text-sm font-bold flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <p className="text-gray-300 pt-1">{step}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Approval time */}
                    {platform.approval_time && (
                        <section className="glass rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-3">Approval Time</h2>
                            <p className="text-gray-300">
                                After submitting to {platform.name}, expect an approval time of approximately{' '}
                                <strong className="text-white">{platform.approval_time}</strong>.
                                Make sure your submission meets all requirements to avoid delays.
                            </p>
                        </section>
                    )}

                    {/* Rules */}
                    {platform.rules && (
                        <section className="glass rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-3">Rules & Moderation</h2>
                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <p className="text-gray-300">{platform.rules}</p>
                            </div>
                        </section>
                    )}

                    {/* Best time to post */}
                    {platform.best_time_to_post && (
                        <section className="glass rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-3">Best Time to Post</h2>
                            <p className="text-gray-300">
                                For maximum visibility on {platform.name}, the best time to post is{' '}
                                <strong className="text-white">{platform.best_time_to_post}</strong>.
                            </p>
                        </section>
                    )}

                    {/* Comparison Table */}
                    {internalLinks.relatedPlatforms.length > 0 && (
                        <section className="glass rounded-xl p-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Top 3 Alternatives to {platform.name}</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead>
                                        <tr className="border-b border-white/5 text-gray-400">
                                            <th className="pb-3 pr-4">Platform</th>
                                            <th className="pb-3 pr-4">DA</th>
                                            <th className="pb-3 pr-4">Pricing</th>
                                            <th className="pb-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {internalLinks.relatedPlatforms.slice(0, 3).map((alt) => {
                                            const p = allPlatforms.find(ap => ap.slug === alt.slug);
                                            return (
                                                <tr key={alt.slug} className="group">
                                                    <td className="py-4 pr-4">
                                                        <Link href={`/platform/${alt.slug}`} className="text-white hover:text-purple-400 font-medium">
                                                            {alt.name}
                                                        </Link>
                                                    </td>
                                                    <td className="py-4 pr-4 text-gray-400">{p?.domainAuthority || '-'}</td>
                                                    <td className="py-4 pr-4 text-gray-400">{p?.pricing || '-'}</td>
                                                    <td className="py-4">
                                                        <Link href={`/platform/${alt.slug}`} className="text-purple-400 hover:text-purple-300">
                                                            View Guide →
                                                        </Link>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    )}

                    {/* Tips for getting accepted */}
                    <section className="glass rounded-xl p-6">
                        <h2 className="text-xl font-semibold text-white mb-4">Tips for Getting Accepted</h2>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-2 text-gray-300">
                                <span className="text-green-400">💡</span>
                                <span>Ensure your product has a professional landing page with clear value proposition.</span>
                            </li>
                            <li className="flex items-start gap-2 text-gray-300">
                                <span className="text-green-400">💡</span>
                                <span>Write a compelling, concise description that highlights what makes your product unique.</span>
                            </li>
                            <li className="flex items-start gap-2 text-gray-300">
                                <span className="text-green-400">💡</span>
                                <span>Include high-quality screenshots or demo videos that showcase your product.</span>
                            </li>
                            {platform.best_time_to_post && (
                                <li className="flex items-start gap-2 text-gray-300">
                                    <span className="text-green-400">💡</span>
                                    <span>Submit during {platform.best_time_to_post} for maximum visibility.</span>
                                </li>
                            )}
                            <li className="flex items-start gap-2 text-gray-300">
                                <span className="text-green-400">💡</span>
                                <span>Follow all the platform rules carefully to avoid rejection.</span>
                            </li>
                        </ul>
                    </section>

                    {/* CTA */}
                    <div className="flex justify-center py-8">
                        <CTAButton
                            href={platform.submissionLink}
                            label={`Submit to ${platform.name}`}
                            platformName={platform.name}
                        />
                    </div>

                    {/* FAQ */}
                    {faqs.length > 0 && (
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
                    )}

                    {/* Tags */}
                    {platform.tags && platform.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {platform.tags.map((tag) => (
                                <a
                                    key={tag}
                                    href={`/tag/${tag.toLowerCase()}`}
                                    className="text-xs px-3 py-1.5 rounded-full glass text-gray-400 hover:text-purple-300 hover:border-purple-500/30 transition-all"
                                >
                                    #{tag}
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Last verified */}
                    {platform.last_verified_at && (
                        <p className="text-xs text-gray-600">
                            Last verified: {platform.last_verified_at}
                        </p>
                    )}
                </article>

                {/* Sidebar */}
                <aside className="space-y-6" aria-label="Platform quick info">
                    {/* Quick info card */}
                    <div className="glass rounded-xl p-6 sticky top-24">
                        <h3 className="text-lg font-semibold text-white mb-4">Quick Info</h3>
                        <div className="space-y-3 text-sm mb-6">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Pricing</span>
                                <span className="text-white">{platform.pricing || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Approval</span>
                                <span className="text-white">{platform.approval_time || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Backlinks</span>
                                <span className="text-white">{platform.backlinkType || '-'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">DA</span>
                                <span className="text-white">{platform.domainAuthority || '-'}</span>
                            </div>
                        </div>
                        <CTAButton
                            href={platform.submissionLink}
                            label="Submit Now"
                            platformName={platform.name}
                        />
                    </div>

                    <RelatedLinks links={internalLinks} />
                </aside>
            </div>
        </>
    );
}

// ─── Helper component ───
function DetailItem({ label, value }: { label: string; value?: string }) {
    return (
        <div>
            <span className="text-xs text-gray-500 uppercase tracking-wider">{label}</span>
            <p className="text-gray-200 text-sm mt-0.5 capitalize">{value || '-'}</p>
        </div>
    );
}
