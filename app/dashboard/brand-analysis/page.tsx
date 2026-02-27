'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Sparkles, TrendingUp, Users, Target, Lightbulb } from 'lucide-react';
import { BrandAnalysisResult } from '@/lib/ai/brand-analyzer';
import { useSubscriptionStore } from '@/lib/store/subscription-store';
import { useRouter } from 'next/navigation';

export default function BrandAnalysisPage() {
    const router = useRouter();
    const { incrementUsage } = useSubscriptionStore();
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<BrandAnalysisResult | null>(null);
    const [formData, setFormData] = useState({
        brandName: '',
        description: '',
        targetAudience: '',
        industry: '',
        goals: [] as string[],
    });

    const goalOptions = [
        'Find clients',
        'Hire talent',
        'Build audience',
        'Promote products',
        'Network with peers',
        'Get feedback',
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/ai/analyze-brand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (result.success) {
                setAnalysis(result.data);
                incrementUsage('brandAnalysisToday');
            } else {
                alert(result.error || 'Failed to analyze brand');
            }
        } catch (error) {
            console.error('Analysis error:', error);
            alert('Failed to analyze brand. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const toggleGoal = (goal: string) => {
        setFormData(prev => ({
            ...prev,
            goals: prev.goals.includes(goal)
                ? prev.goals.filter(g => g !== goal)
                : [...prev.goals, goal],
        }));
    };

    return (
        <main className="min-h-screen relative overflow-hidden">
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="container mx-auto px-4 py-12">
                {/* Header */}
                <div className="mb-12">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-white/60 hover:text-white mb-4 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-primary-400 to-purple-500 bg-clip-text text-transparent">
                            AI Brand Analysis
                        </span>
                    </h1>
                    <p className="text-xl text-white/70">
                        Get deep insights into your brand, niche, and growth opportunities
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Form */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-strong rounded-3xl p-8"
                    >
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-primary-400" />
                            Tell Us About Your Brand
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2">Brand Name *</label>
                                <input
                                    type="text"
                                    value={formData.brandName}
                                    onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-500 focus:outline-none"
                                    placeholder="e.g., TechFlow"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Description *</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-500 focus:outline-none min-h-[120px]"
                                    placeholder="Describe what your brand does and what makes it unique..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Target Audience</label>
                                <input
                                    type="text"
                                    value={formData.targetAudience}
                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-500 focus:outline-none"
                                    placeholder="e.g., SaaS founders, developers, agencies"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Industry</label>
                                <input
                                    type="text"
                                    value={formData.industry}
                                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                                    className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-primary-500 focus:outline-none"
                                    placeholder="e.g., SaaS, E-commerce, Consulting"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-3">Your Goals</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {goalOptions.map((goal) => (
                                        <button
                                            key={goal}
                                            type="button"
                                            onClick={() => toggleGoal(goal)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${formData.goals.includes(goal)
                                                    ? 'bg-primary-500 text-white'
                                                    : 'glass hover:bg-white/10'
                                                }`}
                                        >
                                            {goal}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-primary-500 to-purple-500 hover:from-primary-600 hover:to-purple-600 font-semibold text-lg shadow-lg shadow-primary-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-5 h-5" />
                                        Analyze My Brand
                                    </>
                                )}
                            </button>
                        </form>
                    </motion.div>

                    {/* Results */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {!analysis ? (
                            <div className="glass-strong rounded-3xl p-8 flex flex-col items-center justify-center min-h-[600px]">
                                <TrendingUp className="w-16 h-16 text-white/20 mb-4" />
                                <p className="text-white/60 text-center">
                                    Fill out the form to get AI-powered insights about your brand
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Niche & Market Position */}
                                <div className="glass-strong rounded-2xl p-6">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Target className="w-5 h-5 text-primary-400" />
                                        Niche & Market Position
                                    </h3>
                                    <div className="space-y-3">
                                        <div>
                                            <span className="text-sm text-white/60">Niche:</span>
                                            <p className="font-semibold">{analysis.niche}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-white/60">Market Position:</span>
                                            <p className="text-white/80">{analysis.marketPosition}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Key Insights */}
                                <div className="glass-strong rounded-2xl p-6">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Lightbulb className="w-5 h-5 text-yellow-400" />
                                        Key Insights
                                    </h3>
                                    <ul className="space-y-2">
                                        {analysis.keyInsights.map((insight, i) => (
                                            <li key={i} className="flex items-start gap-2">
                                                <span className="text-primary-400 mt-1">•</span>
                                                <span className="text-white/80">{insight}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Target Communities */}
                                <div className="glass-strong rounded-2xl p-6">
                                    <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                        <Users className="w-5 h-5 text-purple-400" />
                                        Target Communities
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.targetCommunities.map((community, i) => (
                                            <span key={i} className="px-3 py-1 rounded-full glass text-sm">
                                                {community}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* View Directories Button */}
                                <button
                                    onClick={() => router.push('/directories')}
                                    className="w-full py-4 rounded-xl glass hover:bg-white/20 font-semibold transition-all"
                                >
                                    View Recommended Directories →
                                </button>
                            </>
                        )}
                    </motion.div>
                </div>
            </div>
        </main>
    );
}
