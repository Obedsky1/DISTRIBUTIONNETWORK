'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown, Users, Search } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';

export default function PricingCards() {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const { user, openAuthModal } = useAuthStore();

    const handleSelectPlan = async (planId: string) => {
        if (planId === 'FREE') {
            router.push('/profile');
            return;
        }

        if (!user) {
            openAuthModal();
            return;
        }

        setLoading(planId);

        try {
            const response = await fetch('/api/flutterwave/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    planId,
                    userId: user.id,
                    userEmail: user.email,
                    userName: user.displayName || user.email?.split('@')[0] || 'User',
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to initialize checkout');
            }

            if (data.url) {
                window.location.href = data.url;
            } else {
                throw new Error('No checkout URL returned');
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('Failed to start checkout. Please try again.');
        } finally {
            setLoading(null);
        }
    };

    const plans = [
        {
            id: 'FREE',
            name: 'Free',
            price: '0',
            icon: Sparkles,
            color: 'from-blue-500 to-cyan-500',
            buttonText: 'Get Started Free',
            popular: false,
            features: [
                '1 active campaign (SEO or Betatester)',
                'Full campaign analytics & progress tracking',
                'Access to 500+ curated directories',
                'Smart directory recommendations (questionnaire)',
                'Add directories to your pipeline',
                'Community discovery page',
                '100% free — no credit card needed',
            ]
        },
        {
            id: 'PRO',
            name: 'Pro Distribute',
            price: '9.99',
            originalPrice: '99.99',
            icon: Zap,
            color: 'from-indigo-500 to-blue-500',
            buttonText: 'Start distributing',
            popular: true,
            features: [
                'Unlimited campaigns',
                '7 premium campaign types (Community, AI SEO, PR & News, Product Distribute, Reddit Growth, Newsletter Outreach, Social Media Blitz)',
                'Social Listening — scan Reddit & Twitter for relevant conversations + AI reply suggestions',
                'Drip execution — unlock distribution in focused phases to maximize impact',
                'Kanban pipeline board (Discover → Pipeline → Table views)',
                'Submission workspace per directory (notes, status, live URL tracking)',
                'Backlink visibility tracking (DoFollow / NoFollow detection)',
                'Advanced submission tracking with live URL + backlink type',
                'ROI & campaign progress analytics dashboard',
                'AI SEO visibility (ChatGPT, Perplexity & Claude presence)',
                'Access to betatester communities for early adopters',
            ]
        },
        {
            id: 'DONE_FOR_YOU',
            name: 'Done For You',
            price: '99',
            icon: Crown,
            color: 'from-orange-500 to-red-500',
            buttonText: 'Pay with Flutterwave',
            popular: false,
            features: [
                'Everything in Pro — fully managed',
                'Our team handles all distribution for you',
                'Complete transparent reporting & proof of work',
                'Priority support & dedicated Slack channel',
            ]
        },
    ];

    return (
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan, index) => {
                const Icon = plan.icon;
                const isPopular = plan.popular;

                return (
                    <motion.div
                        key={plan.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * index }}
                        className={`relative ${isPopular ? 'md:scale-105 z-10' : 'z-0'}`}
                    >
                        {isPopular && (
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full text-sm font-semibold text-white shadow-lg">
                                Most Popular
                            </div>
                        )}

                        <div className={`bg-gray-900/40 backdrop-blur-xl rounded-3xl p-8 h-full flex flex-col border ${isPopular ? 'border-indigo-500/50 shadow-2xl shadow-indigo-500/10' : 'border-white/10'}`}>
                            {/* Icon */}
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>

                            {/* Plan Name */}
                            <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                                    <span className="text-white/50 font-medium">/month</span>
                                </div>
                                {(plan as any).originalPrice && (
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="text-sm text-white/30 line-through">${(plan as any).originalPrice}</span>
                                        <span className="text-[10px] font-bold bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full uppercase tracking-wider">Early Bird</span>
                                    </div>
                                )}
                            </div>

                            {/* Features */}
                            <ul className="space-y-4 mb-8 flex-grow">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                                        </div>
                                        <span className="text-white/80 text-sm leading-relaxed">{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* CTA Button */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleSelectPlan(plan.id)}
                                disabled={loading === plan.id}
                                className={`w-full py-4 rounded-xl font-semibold transition-all shadow-lg text-sm mt-auto ${isPopular
                                    ? 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-indigo-500/25'
                                    : 'bg-white/10 hover:bg-white/20 text-white'
                                    }`}
                            >
                                {loading === plan.id ? 'Processing...' : plan.buttonText}
                            </motion.button>
                        </div>
                    </motion.div>
                );
            })}

            {/* Motivational Footer Section */}
            <div className="md:col-span-3 mt-12 p-8 md:p-12 bg-white/5 border border-white/10 rounded-[3rem] relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-transform">
                    <Crown className="w-32 h-32 text-indigo-400" />
                </div>
                <div className="relative z-10">
                    <h4 className="text-xl md:text-2xl font-black mb-6 bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent">
                        There is no more room for excuses.
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-4">
                                <Users className="w-5 h-5 text-indigo-400" />
                            </div>
                            <p className="text-white font-bold leading-tight">No excuse for not getting your first 100 paying users.</p>
                            <p className="text-white/30 text-xs">Distribution is solved.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4">
                                <Search className="w-5 h-5 text-emerald-400" />
                            </div>
                            <p className="text-white font-bold leading-tight">No excuse for not getting to #1 in Google search.</p>
                            <p className="text-white/30 text-xs">SEO dominance is here.</p>
                        </div>
                        <div className="space-y-2">
                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center mb-4">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                            </div>
                            <p className="text-white font-bold leading-tight">No excuse for ChatGPT not recommending you to its 800 million users.</p>
                            <p className="text-white/30 text-xs">AI awareness is automated.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
