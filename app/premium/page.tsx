'use client';

import { useState } from 'react';
import { Sparkles, MessageSquare, FileText, Image, User, Reply, Lock, ArrowRight } from 'lucide-react';

type ContentType = 'comment' | 'story' | 'post' | 'caption' | 'bio' | 'reply';

export default function PremiumPage() {
    const [selectedType, setSelectedType] = useState<ContentType>('comment');

    const contentTypes = [
        { id: 'comment' as ContentType, name: 'Comment', icon: MessageSquare, description: 'Engaging comments' },
        { id: 'story' as ContentType, name: 'Story', icon: FileText, description: 'Compelling narratives' },
        { id: 'post' as ContentType, name: 'Post', icon: FileText, description: 'Social media posts' },
        { id: 'caption' as ContentType, name: 'Caption', icon: Image, description: 'Catchy captions' },
        { id: 'bio' as ContentType, name: 'Bio', icon: User, description: 'Profile descriptions' },
        { id: 'reply' as ContentType, name: 'Reply', icon: Reply, description: 'Smart replies' },
    ];

    return (
        <main className="min-h-screen bg-[#0a0a0f] text-white">
            <div className="max-w-6xl mx-auto px-4 py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-4 animate-pulse">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <span className="text-sm font-bold text-indigo-400">COMING SOON</span>
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                        AI Content Generator
                    </h1>
                    <p className="text-xl text-white/50 max-w-2xl mx-auto">
                        Create high-converting distribution content with our custom-trained AI agent. We are currently calibrating the model to ensure maximum engagement.
                    </p>
                </div>

                {/* Content Type Selector - LOCKED */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 opacity-40 pointer-events-none grayscale">
                    {contentTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                            <div
                                key={type.id}
                                className="p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col items-center"
                            >
                                <Icon className="w-6 h-6 mx-auto mb-2" />
                                <div className="text-sm font-medium">{type.name}</div>
                                <div className="text-xs text-gray-400 mt-1">{type.description}</div>
                            </div>
                        );
                    })}
                </div>

                {/* Generator - LOCKED */}
                <div className="relative">
                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 opacity-20 pointer-events-none">
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2 text-white/40">
                                What would you like to create?
                            </label>
                            <div className="w-full h-32 px-4 py-3 bg-white/5 border border-white/10 rounded-xl" />
                        </div>
                        <div className="w-full py-4 bg-indigo-600 rounded-xl" />
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-6">
                        <div className="p-8 bg-[#0f1018] rounded-[2.5rem] border border-white/10 backdrop-blur-md shadow-2xl max-w-md">
                            <div className="w-20 h-20 bg-indigo-500/20 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
                                <Lock className="w-10 h-10 text-indigo-400" />
                            </div>
                            <h3 className="text-2xl font-black text-white mb-3">Feature Locked</h3>
                            <p className="text-white/50 mb-8 leading-relaxed">
                                AI Content Generation is a premium feature launching in the next update. Upgrade to Pro now to get early access!
                            </p>
                            <div className="space-y-3">
                                <button
                                    className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center justify-center gap-2"
                                    onClick={() => window.location.href = '/pricing'}
                                >
                                    <Sparkles className="w-4 h-4" /> Get Pro Membership
                                </button>
                                <p className="text-[10px] text-white/30 uppercase font-black tracking-widest">Priority Access for Early Adopters</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
