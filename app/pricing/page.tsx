import { Sparkles } from 'lucide-react';
import PricingCards from '@/components/PricingCards';

export default function PricingPage() {
    return (
        <main className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-gray-900 to-black text-white">
            {/* Background elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
            </div>

            <div className="container mx-auto px-4 py-20 relative z-10">
                {/* Header */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 font-medium text-sm text-indigo-300">
                        <Sparkles className="w-4 h-4" />
                        <span>Simple, Transparent Pricing</span>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
                        Choose Your <span className="bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">Distribution Growth</span> Plan
                    </h1>

                    <p className="text-lg text-white/60">
                        Distribute your product, maximize your visibility, and access 500+ distribution channels with Flutterwave secure payments.
                    </p>
                </div>

                {/* Twitter Testimonials Section */}
                <div className="mb-20">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-2">
                            Distribution is Everything
                        </h2>
                        <p className="text-sm text-white/50">See what the community is saying</p>
                    </div>

                    {/* Masonry-like grid for Tweets */}
                    <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                        {/* Tweet 1 */}
                        <div className="break-inside-avoid bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-indigo-500/50 transition-colors">
                            <blockquote className="twitter-tweet" data-theme="dark">
                                <p lang="en" dir="ltr">Distribution beats optimization for news SEO. <a href="https://t.co/iScIEclAit">https://t.co/iScIEclAit</a></p>&mdash; Natia Kurdadze - SEO (@seonatia) <a href="https://twitter.com/seonatia/status/2006644119020716530?ref_src=twsrc%5Etfw">January 1, 2026</a>
                            </blockquote>
                        </div>

                        {/* Tweet 2 */}
                        <div className="break-inside-avoid bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-indigo-500/50 transition-colors">
                            <blockquote className="twitter-tweet" data-theme="dark">
                                <p lang="en" dir="ltr">“Now I think people are going to be much more focused on marketing on distribution”<br /><br />AI can’t solve distribution<br /><br /> <a href="https://t.co/zJtVT6dHlB">pic.twitter.com/zJtVT6dHlB</a></p>&mdash; Matthew Kobach (@mkobach) <a href="https://twitter.com/mkobach/status/2024331681872658647?ref_src=twsrc%5Etfw">February 19, 2026</a>
                            </blockquote>
                        </div>

                        {/* Tweet 3 */}
                        <div className="break-inside-avoid bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-indigo-500/50 transition-colors">
                            <blockquote className="twitter-tweet" data-theme="dark">
                                <p lang="en" dir="ltr">People great at marketing and distribution are about to get insanely rich.</p>&mdash; Saurabh (@TheOvermanEthos) <a href="https://twitter.com/TheOvermanEthos/status/2027707871836635349?ref_src=twsrc%5Etfw">February 28, 2026</a>
                            </blockquote>
                            {/* Tweet 5 */}
                            <div className="break-inside-avoid bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-indigo-500/50 transition-colors">
                                <blockquote className="twitter-tweet" data-theme="dark">
                                    <p lang="en" dir="ltr">Layers just distributed, and it’s rethinking marketing for developers.<br /><br />Most developers build good products. But getting users is where things break.<br /><br />Not because the product is bad - because distribution is hard.<br /><br />That’s the problem Layers is built to solve.<br /><br />Here’s why it matters: <a href="https://t.co/eYCmB7J531">pic.twitter.com/eYCmB7J531</a></p>&mdash; Markandey Sharma (@TechByMarkandey) <a href="https://twitter.com/TechByMarkandey/status/2024506793972682816?ref_src=twsrc%5Etfw">February 19, 2026</a>
                                </blockquote>
                            </div>

                            {/* Tweet 6 */}
                            <div className="break-inside-avoid bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-indigo-500/50 transition-colors">
                                <blockquote className="twitter-tweet" data-theme="dark">
                                    <p lang="en" dir="ltr">Stop building features that nobody is ever going to see. If you’re a startup founder, you need to hear this right now.<br /><br />You can fall down a rabbit hole building ten features, ten tools, ten ideas… but often neglect distribution and marketing. You can have amazing tech - but if… <a href="https://t.co/xfWWsZC9hP">pic.twitter.com/xfWWsZC9hP</a></p>&mdash; Victor Young (@VictorYoungMe) <a href="https://twitter.com/VictorYoungMe/status/2026587547762307175?ref_src=twsrc%5Etfw">February 25, 2026</a>
                                </blockquote>
                            </div>
                        </div>

                        {/* Tweet 4 */}
                        <div className="break-inside-avoid bg-white/5 rounded-2xl p-4 border border-white/10 hover:border-indigo-500/50 transition-colors">
                            <blockquote className="twitter-tweet" data-theme="dark">
                                <p lang="en" dir="ltr">YC giving their expert advice: <br />“Build something people want” <br />“Talk to users”<br />“Hire A players” <br />“Focus on distribution” <br /><br />Founders: <a href="https://t.co/gH4oiLcvuE">pic.twitter.com/gH4oiLcvuE</a></p>&mdash; VCs Congratulating Themselves 👏👏👏 (@VCBrags) <a href="https://twitter.com/VCBrags/status/2026017038255177804?ref_src=twsrc%5Etfw">February 23, 2026</a>
                            </blockquote>
                        </div>
                    </div>
                    {/* Load Twitter Widgets Script */}
                    <script async src="https://platform.twitter.com/widgets.js" charSet="utf-8"></script>
                </div>

                {/* Pricing Cards Component */}
                <div className="mb-20">
                    <PricingCards />
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

                    <div className="grid gap-6">
                        {[
                            {
                                q: 'Can I change my plan later?',
                                a: 'Yes! You can upgrade or downgrade your plan at any time from your dashboard.',
                            },
                            {
                                q: 'What payment methods do you accept?',
                                a: 'We use Flutterwave to safely and securely process payments directly from your Dashboard.',
                            },
                            {
                                q: 'What is the "Done For You" plan?',
                                a: 'If you want to focus completely on your product, our team will handle the distribution and directory submissions for you from end to end.',
                            }
                        ].map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors"
                            >
                                <h3 className="text-lg font-bold mb-2 text-white">{faq.q}</h3>
                                <p className="text-white/60 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
