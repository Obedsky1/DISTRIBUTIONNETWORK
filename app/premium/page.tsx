'use client';

import { useState } from 'react';
import { Sparkles, MessageSquare, FileText, Image, User, Reply } from 'lucide-react';

type ContentType = 'comment' | 'story' | 'post' | 'caption' | 'bio' | 'reply';

export default function PremiumPage() {
    const [selectedType, setSelectedType] = useState<ContentType>('comment');
    const [prompt, setPrompt] = useState('');
    const [generatedContent, setGeneratedContent] = useState('');
    const [loading, setLoading] = useState(false);

    const contentTypes = [
        { id: 'comment' as ContentType, name: 'Comment', icon: MessageSquare, description: 'Engaging comments' },
        { id: 'story' as ContentType, name: 'Story', icon: FileText, description: 'Compelling narratives' },
        { id: 'post' as ContentType, name: 'Post', icon: FileText, description: 'Social media posts' },
        { id: 'caption' as ContentType, name: 'Caption', icon: Image, description: 'Catchy captions' },
        { id: 'bio' as ContentType, name: 'Bio', icon: User, description: 'Profile descriptions' },
        { id: 'reply' as ContentType, name: 'Reply', icon: Reply, description: 'Smart replies' },
    ];

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setLoading(true);
        setGeneratedContent('');

        try {
            // Simulate API call - replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setGeneratedContent(
                'This is a sample generated content. Configure your Gemini API key to enable real AI generation.'
            );
        } catch (error) {
            console.error('Generation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-4">
                        <Sparkles className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm font-medium">Growth Tools</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        AI Content Generator
                    </h1>
                    <p className="text-xl text-gray-300">
                        Create engaging content to stand out in communities and attract clients
                    </p>
                </div>


                {/* Content Type Selector */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {contentTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                            <button
                                key={type.id}
                                onClick={() => setSelectedType(type.id)}
                                className={`p-4 rounded-2xl transition-all ${selectedType === type.id
                                    ? 'bg-gradient-to-br from-indigo-600 to-blue-600'
                                    : 'glass hover:glass-strong'
                                    }`}
                            >
                                <Icon className="w-6 h-6 mx-auto mb-2" />
                                <div className="text-sm font-medium">{type.name}</div>
                                <div className="text-xs text-gray-400 mt-1">{type.description}</div>
                            </button>
                        );
                    })}
                </div>

                {/* Generator */}
                <div className="glass-strong rounded-3xl p-8">
                    <div className="mb-6">
                        <label className="block text-sm font-medium mb-2">
                            What would you like to create?
                        </label>
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder={`Enter your ${selectedType} prompt here...`}
                            className="w-full h-32 px-4 py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                    </div>

                    <button
                        onClick={handleGenerate}
                        disabled={loading || !prompt.trim()}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl font-semibold hover:scale-105 transition-transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                Generating...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Generate {selectedType}
                            </>
                        )}
                    </button>

                    {/* Generated Content */}
                    {generatedContent && (
                        <div className="mt-6 p-6 glass rounded-2xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-semibold">Generated {selectedType}</h3>
                                <button className="px-4 py-2 glass rounded-lg hover:glass-strong transition-all text-sm">
                                    Copy
                                </button>
                            </div>
                            <p className="text-gray-300 whitespace-pre-wrap">{generatedContent}</p>
                        </div>
                    )}
                </div>

                {/* Premium Notice */}
                <div className="mt-8 text-center glass-strong rounded-2xl p-6">
                    <p className="text-gray-400">
                        💎 Premium feature - Upgrade to unlock unlimited AI content generation
                    </p>
                </div>
            </div>
        </main>
    );
}
