'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Search, FileText, Tag, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SEOToolsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'keywords' | 'metatags' | 'analyze'>('keywords');
    const [loading, setLoading] = useState(false);
    const [keywords, setKeywords] = useState<string[]>([]);
    const [metaTags, setMetaTags] = useState<any>(null);
    const [analysis, setAnalysis] = useState<any>(null);

    const [keywordInput, setKeywordInput] = useState('');
    const [metaInput, setMetaInput] = useState({ topic: '', description: '' });
    const [analyzeInput, setAnalyzeInput] = useState({ content: '', targetKeyword: '' });

    const handleKeywordGeneration = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/ai/seo-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'keywords',
                    topic: keywordInput,
                    keywordCount: 15,
                }),
            });

            const result = await response.json();
            if (result.success) {
                setKeywords(result.data);
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Failed to generate keywords');
        } finally {
            setLoading(false);
        }
    };

    const handleMetaGeneration = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/ai/seo-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'metatags',
                    topic: metaInput.topic,
                    description: metaInput.description,
                }),
            });

            const result = await response.json();
            if (result.success) {
                setMetaTags(result.data);
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Failed to generate meta tags');
        } finally {
            setLoading(false);
        }
    };

    const handleAnalysis = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/ai/seo-analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'analyze',
                    content: analyzeInput.content,
                    targetKeyword: analyzeInput.targetKeyword,
                }),
            });

            const result = await response.json();
            if (result.success) {
                setAnalysis(result.data);
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('Failed to analyze content');
        } finally {
            setLoading(false);
        }
    };

    const tabs = [
        { id: 'keywords' as const, label: 'Keyword Research', icon: Search },
        { id: 'metatags' as const, label: 'Meta Tags', icon: Tag },
        { id: 'analyze' as const, label: 'Content Analysis', icon: FileText },
    ];

    return (
        <main className="min-h-screen relative overflow-hidden">
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="mb-12">
                    <button
                        onClick={() => router.push('/dashboard')}
                        className="text-white/60 hover:text-white mb-4 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                            Free SEO Tools
                        </span>
                    </h1>
                    <p className="text-xl text-white/70">
                        Optimize your content and improve your search rankings
                    </p>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-4 mb-8 overflow-x-auto">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold whitespace-nowrap transition-all ${activeTab === tab.id
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                        : 'glass hover:bg-white/10'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Keyword Research */}
                {activeTab === 'keywords' && (
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="glass-strong rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6">Generate Keywords</h2>
                            <form onSubmit={handleKeywordGeneration} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Topic or Niche</label>
                                    <input
                                        type="text"
                                        value={keywordInput}
                                        onChange={(e) => setKeywordInput(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-green-500 focus:outline-none"
                                        placeholder="e.g., SaaS marketing, AI tools"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                                    {loading ? 'Generating...' : 'Generate Keywords'}
                                </button>
                            </form>
                        </div>

                        <div className="glass-strong rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6">Results</h2>
                            {keywords.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {keywords.map((keyword, index) => (
                                        <span
                                            key={index}
                                            className="px-4 py-2 rounded-full glass text-sm hover:bg-white/10 cursor-pointer transition-all"
                                            onClick={() => navigator.clipboard.writeText(keyword)}
                                        >
                                            {keyword}
                                        </span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-white/60">Enter a topic to generate relevant keywords</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Meta Tags */}
                {activeTab === 'metatags' && (
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="glass-strong rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6">Generate Meta Tags</h2>
                            <form onSubmit={handleMetaGeneration} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Page Topic</label>
                                    <input
                                        type="text"
                                        value={metaInput.topic}
                                        onChange={(e) => setMetaInput({ ...metaInput, topic: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-green-500 focus:outline-none"
                                        placeholder="e.g., Best AI Tools for Marketing"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Brief Description (optional)</label>
                                    <textarea
                                        value={metaInput.description}
                                        onChange={(e) => setMetaInput({ ...metaInput, description: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-green-500 focus:outline-none min-h-[100px]"
                                        placeholder="Briefly describe what the page is about"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Tag className="w-5 h-5" />}
                                    {loading ? 'Generating...' : 'Generate Meta Tags'}
                                </button>
                            </form>
                        </div>

                        <div className="glass-strong rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6">Generated Tags</h2>
                            {metaTags ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-white/60 mb-1 block">Title Tag</label>
                                        <div className="p-3 rounded-xl glass-dark">
                                            <code className="text-sm">{metaTags.title}</code>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-white/60 mb-1 block">Meta Description</label>
                                        <div className="p-3 rounded-xl glass-dark">
                                            <code className="text-sm">{metaTags.description}</code>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-white/60 mb-1 block">Keywords</label>
                                        <div className="p-3 rounded-xl glass-dark">
                                            <code className="text-sm">{metaTags.keywords}</code>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-white/60">Fill out the form to generate optimized meta tags</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Content Analysis */}
                {activeTab === 'analyze' && (
                    <div className="grid lg:grid-cols-2 gap-8">
                        <div className="glass-strong rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6">Analyze Content</h2>
                            <form onSubmit={handleAnalysis} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Content</label>
                                    <textarea
                                        value={analyzeInput.content}
                                        onChange={(e) => setAnalyzeInput({ ...analyzeInput, content: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-green-500 focus:outline-none min-h-[200px]"
                                        placeholder="Paste your content here..."
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Target Keyword (optional)</label>
                                    <input
                                        type="text"
                                        value={analyzeInput.targetKeyword}
                                        onChange={(e) => setAnalyzeInput({ ...analyzeInput, targetKeyword: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl glass border border-white/10 focus:border-green-500 focus:outline-none"
                                        placeholder="e.g., AI marketing tools"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-semibold shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <TrendingUp className="w-5 h-5" />}
                                    {loading ? 'Analyzing...' : 'Analyze Content'}
                                </button>
                            </form>
                        </div>

                        <div className="glass-strong rounded-2xl p-8">
                            <h2 className="text-2xl font-bold mb-6">Analysis Results</h2>
                            {analysis ? (
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl glass-dark">
                                        <div className="text-3xl font-bold text-green-400 mb-2">{analysis.score}/100</div>
                                        <div className="text-sm text-white/60">SEO Score</div>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold mb-2">Top Recommendations</h3>
                                        <ul className="space-y-2">
                                            {analysis.recommendations?.slice(0, 5).map((rec: any, i: number) => (
                                                <li key={i} className="text-sm text-white/80 flex items-start gap-2">
                                                    <span className="text-green-400">•</span>
                                                    {rec.suggestion}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-white/60">Paste your content to get SEO insights and recommendations</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
