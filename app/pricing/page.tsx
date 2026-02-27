'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles, Zap, Crown } from 'lucide-react';
import { useState } from 'react';
import { PRICING_PLANS } from '@/lib/stripe/config';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handleSelectPlan = async (planId: string) => {
        if (planId === 'FREE') {
            router.push('/dashboard');
            return;
        }

        setLoading(planId);

        try {
            // TODO: Get actual user ID from auth
            const userId = 'demo-user-' + Date.now();

            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, userId }),
            });

            const { url } = await response.json();
            if (url) {
                window.location.href = url;
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
            ...PRICING_PLANS.FREE,
            icon: Sparkles,
            color: 'from-blue-500 to-cyan-500',
            buttonText: 'Get Started Free',
        },
        {
            ...PRICING_PLANS.PRO,
            icon: Zap,
            color: 'from-indigo-500 to-blue-500',
            buttonText: 'Start Pro Trial',
        },
        {
            ...PRICING_PLANS.ENTERPRISE,
            icon: Crown,
            color: 'from-orange-500 to-red-500',
            buttonText: 'Contact Sales',
        },
    ];

    return (
        <main className="min-h-screen relative overflow-hidden">
            {/* Background gradients */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="container mx-auto px-4 py-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6"
                    >
                        <Sparkles className="w-4 h-4 text-primary-400" />
                        <span className="text-sm text-white/80">Simple, Transparent Pricing</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-6xl font-bold mb-4"
                    >
                        Choose Your{' '}
                        <span className="bg-gradient-to-r from-primary-400 to-purple-500 bg-clip-text text-transparent">
                            Growth Plan
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-white/70 max-w-2xl mx-auto"
                    >
                        AI-powered tools to analyze your brand, generate content, and grow your business
                    </motion.p>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
                    {plans.map((plan, index) => {
                        const Icon = plan.icon;
                        const isPopular = 'popular' in plan && plan.popular;

                        return (
                            <motion.div
                                key={plan.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 * index }}
                                className={`relative ${isPopular ? 'md:scale-105' : ''}`}
                            >
                                {isPopular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full text-sm font-semibold">
                                        Most Popular
                                    </div>
                                )}

                                <div className={`glass-strong rounded-3xl p-8 h-full flex flex-col ${isPopular ? 'border-2 border-purple-500/50' : ''}`}>
                                    {/* Icon */}
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>

                                    {/* Plan Name */}
                                    <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold">${plan.price}</span>
                                        <span className="text-white/60">/month</span>
                                    </div>

                                    {/* Features */}
                                    <ul className="space-y-3 mb-8 flex-grow">
                                        {plan.features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <Check className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                                                <span className="text-white/80">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => handleSelectPlan(plan.id)}
                                        disabled={loading === plan.id}
                                        className={`w-full py-4 rounded-full font-semibold transition-all ${isPopular
                                            ? 'bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white shadow-lg shadow-indigo-500/50'
                                            : 'glass hover:bg-white/20 text-white'
                                            }`}
                                    >
                                        {loading === plan.id ? 'Loading...' : plan.buttonText}
                                    </motion.button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>

                    <div className="space-y-6">
                        {[
                            {
                                q: 'Can I change my plan later?',
                                a: 'Yes! You can upgrade or downgrade your plan at any time from your dashboard.',
                            },
                            {
                                q: 'What payment methods do you accept?',
                                a: 'We accept all major credit cards through Stripe, our secure payment processor.',
                            },
                            {
                                q: 'Is there a free trial?',
                                a: 'The Free plan is available forever with no credit card required. Pro and Enterprise plans offer a 7-day money-back guarantee.',
                            },
                            {
                                q: 'How does the AI content generation work?',
                                a: 'Our AI uses Google Gemini to generate high-quality, contextual content based on your brand voice and target audience.',
                            },
                        ].map((faq, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                className="glass rounded-2xl p-6"
                            >
                                <h3 className="text-lg font-semibold mb-2">{faq.q}</h3>
                                <p className="text-white/70">{faq.a}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}
