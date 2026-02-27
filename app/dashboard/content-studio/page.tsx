'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Copy, Check, MessageSquare, BookOpen, FileText, Package } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSubscriptionStore } from '@/lib/store/subscription-store';

type ContentType = 'comment' | 'story' | 'post' | 'description';

export default function ContentStudioPage() {
    const router = useRouter();
    const { incrementUsage } = useSubscriptionStore();
    const [selectedType, setSelectedType] = useState<ContentType>('post');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [generatedContent, setGeneratedContent] = useState<string | null>(null);
    const [variations, setVariations] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        productName: '',
        brandVoice: 'professional' as 'professional' | 'casual' | 'friendly' | 'technical',
        targetAudience: '',
        topic: '',
        platform: '',
        additionalContext: '',
    });

    const contentTypes = [
        { id: 'comment' as ContentType, label: 'Comment', icon: MessageSquare, description: 'Engaging social media comments' },
        { id: 'story' as ContentType, label: 'Story', icon: BookOpen, description: 'Brand narratives & founder stories' },
        { id: 'post' as ContentType, label: 'Post', icon: FileText, description: 'Social media & blog posts' },
        { id: 'description' as ContentType, label: 'Description', icon: Package, description: 'Product descriptions' },
    ];

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setGeneratedContent(null);
        setVariations([]);

        try {
            const response = await fetch('/api/ai/generate-content', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: selectedType,
                    context: formData,
                }),
            });

            const result = await response.json();

            if (result.success) {
                setGeneratedContent(result.data.content);
                setVariations(result.data.variations || []);
                incrementUsage('contentGenerationThisMonth');
            } else {
                alert(result.error || 'Failed to generate content');
            }
        } catch (error) {
            console.error('Generation error:', error);
            alert('Failed to generate content. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <main className="min-h-screen relative overflow-hidden">
            <div className="fixed inset-0 -z-10">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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
                        <span className="bg-gradient-to-r from-indigo-400 to-blue-500 bg-clip-text text-transparent">
                            AI Content Studio
                        </span>
                    </h1>
                    <p className="text-xl text-white/70">
                        Generate high-quality content for your brand in seconds
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        {/* Content Type Selector */}
                        <div className="glass-strong rounded-2xl p-6">
                            <h3 className="text-lg font-semibold mb-4">Content Type</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {contentTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            onClick={() => setSelectedType(type.id)}
                                            className={`p-4 rounded-xl transition-all ${selectedType === type.id
                                                ? 'bg-gradient-to-br from-indigo-500 to-blue-500 text-white'
                                                : 'glass hover:bg-white/10'
                                                }`}
                                        >
                                            <Icon className="w-6 h-6 mb-2" />
                                            <div className="font-semibold text-sm">{type.label}</div>
                                            <div className="text-xs opacity-80 mt-1">{type.description}</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Input Form */}
                        <div className="glass-strong rounded-2xl p-6">
                            <h3 className="text-lg font-semibold mb-4">Content Details</h3>
                            <form onSubmit={handleGenerate} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Product/Brand Name</label>
                                    <input
                                        type="text"
                                        value={formData.productName}
                                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl glass border border-white/10 focus:border-purple-500 focus:outline-none"
                                        placeholder="e.g., TechFlow"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Brand Voice</label>
                                    <select
                                        value={formData.brandVoice}
                                        onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value as any })}
                                        className="w-full px-4 py-2 rounded-xl glass border border-white/10 focus:border-purple-500 focus:outline-none"
                                    >
                                        <option value="professional">Professional</option>
                                        <option value="casual">Casual</option>
                                        <option value="friendly">Friendly</option>
                                        <option value="technical">Technical</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Topic/Context</label>
                                    <textarea
                                        value={formData.topic}
                                        onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl glass border border-white/10 focus:border-purple-500 focus:outline-none min-h-[100px]"
                                        placeholder="What should this content be about?"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">Platform (optional)</label>
                                    <input
                                        type="text"
                                        value={formData.platform}
                                        onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                                        className="w-full px-4 py-2 rounded-xl glass border border-white/10 focus:border-purple-500 focus:outline-none"
                                        placeholder="e.g., Twitter, LinkedIn, Reddit"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 font-semibold shadow-lg shadow-indigo-500/50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Generating...
                                        </>
                                    ) : (
                                        'Generate Content'
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Output Section */}
                    <div className="space-y-6">
                        {!generatedContent ? (
                            <div className="glass-strong rounded-2xl p-8 flex flex-col items-center justify-center min-h-[500px]">
                                <FileText className="w-16 h-16 text-white/20 mb-4" />
                                <p className="text-white/60 text-center">
                                    Fill out the form and click generate to create AI-powered content
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Main Content */}
                                <div className="glass-strong rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold">Generated Content</h3>
                                        <button
                                            onClick={() => handleCopy(generatedContent)}
                                            className="flex items-center gap-2 px-4 py-2 rounded-xl glass hover:bg-white/10 transition-all"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-4 h-4 text-green-400" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <div className="p-4 rounded-xl glass-dark">
                                        <p className="whitespace-pre-wrap">{generatedContent}</p>
                                    </div>
                                </div>

                                {/* Variations */}
                                {variations.length > 0 && (
                                    <div className="glass-strong rounded-2xl p-6">
                                        <h3 className="text-lg font-semibold mb-4">Alternative Versions</h3>
                                        <div className="space-y-3">
                                            {variations.map((variation, index) => (
                                                <div key={index} className="p-4 rounded-xl glass-dark group relative">
                                                    <p className="whitespace-pre-wrap text-sm">{variation}</p>
                                                    <button
                                                        onClick={() => handleCopy(variation)}
                                                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-lg glass hover:bg-white/10"
                                                    >
                                                        <Copy className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
