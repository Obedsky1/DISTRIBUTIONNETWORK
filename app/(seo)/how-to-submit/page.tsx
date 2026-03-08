import { Metadata } from 'next';
import { getAllPlatforms } from '@/lib/pseo/platforms';
import { WebPageSchema, FAQSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import Link from 'next/link';
import { SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';

export const revalidate = ISR_REVALIDATE;

export const metadata: Metadata = {
    title: 'How to Submit to Startup Directories (2024 Guide) | DistriBurst',
    description: 'The ultimate guide to submitting your startup to top directories. Learn requirements, submission tips, and access step-by-step guides for 850+ platforms.',
    alternates: {
        canonical: `${SITE_URL}/how-to-submit`,
    },
};

export default async function HowToSubmitHub() {
    const platforms = await getAllPlatforms();
    const directories = platforms.filter(p => p.type === 'directory');

    // Group directories by category for better organization
    const featuredDirectories = directories.slice(0, 12);

    const faqs = [
        {
            question: "Why should I submit my startup to directories?",
            answer: "Submitting to directories helps with SEO by providing high-quality backlinks, increases visibility to early adopters, and can lead to your first 100 customers."
        },
        {
            question: "How long does it take for a directory to approve my startup?",
            answer: "Approval times vary significantly. Some like Product Hunt are instant, while others like BetaList can take 2-4 weeks for free submissions. Paid 'skip the queue' options usually resolve in 24-48 hours."
        },
        {
            question: "Should I pay for directory listings?",
            answer: "It depends on your budget. Paid listings often provide 'DoFollow' backlinks and faster approval, which can be a great investment for initial SEO momentum."
        }
    ];

    return (
        <>
            <WebPageSchema
                title="How to Submit to Startup Directories"
                description="Comprehensive guide for startup distribution and directory submission."
                url="/how-to-submit"
            />
            <FAQSchema faqs={faqs} />

            <div className="max-w-4xl mx-auto">
                <Breadcrumb
                    items={[
                        { label: 'Resources', href: '/' },
                        { label: 'How to Submit', href: '/how-to-submit' },
                    ]}
                />

                <header className="mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                        How to Submit Your Startup to{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            Top Directories
                        </span>
                    </h1>
                    <p className="text-xl text-gray-400 leading-relaxed">
                        Distribution is the hardest part of building a startup. This guide simplifies the process
                        of getting your product listed on the world&apos;s most influential platforms.
                    </p>
                </header>

                {/* Universal Checklist */}
                <section className="glass rounded-3xl p-8 mb-12 border border-white/10 shadow-2xl">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                        <span className="text-3xl">📋</span> Universal Submission Checklist
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ChecklistItem
                            title="Landing Page Ready"
                            desc="Ensure your site is fast, responsive, and has a clear value proposition."
                        />
                        <ChecklistItem
                            title="Product Description"
                            desc="Prepare a short (50 chars) and long (200-500 chars) version of your pitch."
                        />
                        <ChecklistItem
                            title="High-Res Assets"
                            desc="Have a 1024x1024 logo and at least 3 high-quality app screenshots."
                        />
                        <ChecklistItem
                            title="Social Proof"
                            desc="If you have testimonials or user counts, have them ready to share."
                        />
                    </div>
                </section>

                {/* Step-by-Step Hub */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold text-white">Platform-Specific Guides</h2>
                        <span className="text-sm text-gray-500">{directories.length} guides available</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featuredDirectories.map((p) => (
                            <Link
                                key={p.slug}
                                href={`/submit-to-${p.slug}`}
                                className="glass p-5 rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all group"
                            >
                                <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors mb-2">
                                    {p.name}
                                </h3>
                                <p className="text-xs text-gray-500 line-clamp-2 mb-4">
                                    Step-by-step submission guide for {p.name}.
                                </p>
                                <span className="text-xs font-semibold text-purple-400 flex items-center gap-1">
                                    Read Guide <span className="group-hover:translate-x-1 transition-transform">→</span>
                                </span>
                            </Link>
                        ))}
                    </div>

                    {directories.length > 12 && (
                        <div className="mt-8 p-6 bg-purple-600/10 rounded-2xl border border-purple-500/20 text-center">
                            <p className="text-gray-400 mb-4">Looking for a specific platform? Use our indexing hub to find all guides.</p>
                            <Link
                                href="/sitemap-index"
                                className="inline-flex items-center gap-2 text-purple-400 font-bold hover:text-purple-300 transition-colors"
                            >
                                Browse All 850+ Guides →
                            </Link>
                        </div>
                    )}
                </section>

                {/* FAQ Section */}
                <section className="mb-16">
                    <h2 className="text-2xl font-bold text-white mb-8">Frequently Asked Questions</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div key={i} className="glass p-6 rounded-2xl border border-white/5">
                                <h3 className="font-bold text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Final CTA */}
                <section className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-[2.5rem] p-12 text-center shadow-2xl shadow-purple-900/20">
                    <h2 className="text-3xl font-bold text-white mb-4">Tired of manual submissions?</h2>
                    <p className="text-purple-100 mb-8 max-w-xl mx-auto">
                        DistriBurst automates your distribution strategy. Get your startup in front of
                        thousands of users across 800+ platforms with one unified workflow.
                    </p>
                    <Link
                        href="/auth/signup"
                        className="inline-block px-10 py-4 bg-white text-purple-600 font-bold rounded-2xl hover:scale-105 transition-all"
                    >
                        Automate My Distribution
                    </Link>
                </section>
            </div>
        </>
    );
}

function ChecklistItem({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="flex gap-4">
            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-green-400 text-xs">✓</span>
            </div>
            <div>
                <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
