'use client';

import { useState, useEffect } from 'react';
import { Search, ExternalLink, DollarSign, TrendingUp, Filter } from 'lucide-react';

interface Directory {
    id: string;
    name: string;
    platform: string;
    description: string;
    url: string;
    category: string;
    pricing: string;
    domain_authority: number;
    backlink_type: string;
    best_for: string[];
    submission_url?: string;
}

interface Category {
    icon: string;
    description: string;
}

export default function DirectoriesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedPricing, setSelectedPricing] = useState('');
    const [directories, setDirectories] = useState<Directory[]>([]);
    const [categories, setCategories] = useState<Record<string, Category>>({});
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);

    const pricingOptions = ['Free', 'Paid', 'Free/Paid', 'Revenue Share'];

    useEffect(() => {
        fetchDirectories();
    }, [searchQuery, selectedCategory, selectedPricing]);

    const fetchDirectories = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('search', searchQuery);
            if (selectedCategory) params.set('category', selectedCategory);
            if (selectedPricing) params.set('pricing', selectedPricing);
            params.set('limit', '100');
            params.set('sortBy', 'domain_authority');
            params.set('sortOrder', 'desc');

            const res = await fetch(`/api/directories?${params.toString()}`);
            const data = await res.json();

            setDirectories(data.directories || []);
            setCategories(data.categories || {});
            setTotal(data.total || 0);
        } catch (error) {
            console.error('Failed to fetch directories:', error);
        } finally {
            setLoading(false);
        }
    };

    const getPricingColor = (pricing: string) => {
        if (pricing === 'Free') return 'from-green-500 to-emerald-600';
        if (pricing.includes('Free')) return 'from-blue-500 to-cyan-600';
        return 'from-indigo-500 to-blue-600';
    };

    const getDAColor = (da: number) => {
        if (da >= 80) return 'text-green-400';
        if (da >= 60) return 'text-blue-400';
        if (da >= 40) return 'text-yellow-400';
        return 'text-gray-400';
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900">
            {/* Header */}
            <header className="sticky top-0 z-50 glass-dark backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-bold">Launch Directories</h1>
                            <p className="text-xs sm:text-sm text-white/60">{total} directories to promote your product</p>
                        </div>
                        <a
                            href="/"
                            className="glass px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl hover:glass-strong transition-all text-xs sm:text-sm"
                        >
                            ← Home
                        </a>
                    </div>

                    {/* Search Bar */}
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search directories..."
                            className="w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2 sm:py-3 glass rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white/5 text-sm sm:text-base"
                        />
                    </div>

                    {/* Category Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory('')}
                            className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-medium whitespace-nowrap transition-all text-xs sm:text-sm ${!selectedCategory
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600'
                                : 'glass hover:glass-strong'
                                }`}
                        >
                            All
                        </button>
                        {Object.entries(categories).map(([name, cat]) => (
                            <button
                                key={name}
                                onClick={() => setSelectedCategory(name)}
                                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-medium whitespace-nowrap transition-all text-xs sm:text-sm ${selectedCategory === name
                                    ? 'bg-gradient-to-r from-indigo-600 to-blue-600'
                                    : 'glass hover:glass-strong'
                                    }`}
                            >
                                <span className="mr-1.5">{cat.icon}</span>
                                {name}
                            </button>
                        ))}
                    </div>

                    {/* Pricing Filter */}
                    <div className="flex gap-2 mt-2 overflow-x-auto pb-2 scrollbar-hide">
                        {pricingOptions.map((pricing) => (
                            <button
                                key={pricing}
                                onClick={() => setSelectedPricing(selectedPricing === pricing ? '' : pricing)}
                                className={`px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg font-medium whitespace-nowrap transition-all text-xs ${selectedPricing === pricing
                                    ? 'bg-white/20'
                                    : 'bg-white/5 hover:bg-white/10'
                                    }`}
                            >
                                {pricing}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
                {loading ? (
                    <div className="text-center py-20">
                        <div className="inline-flex items-center gap-3 glass-strong px-4 sm:px-6 py-3 sm:py-4 rounded-2xl">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-300 text-sm sm:text-base">Loading directories...</span>
                        </div>
                    </div>
                ) : directories.length === 0 ? (
                    <div className="text-center py-12 glass-strong rounded-2xl">
                        <h3 className="text-lg sm:text-xl font-semibold mb-2">No directories found</h3>
                        <p className="text-gray-400 text-sm sm:text-base">
                            Try adjusting your search or filters
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                        {directories.map((directory) => (
                            <div
                                key={directory.id}
                                className="glass-strong rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-[1.02] transition-all duration-300 group"
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3 sm:mb-4">
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-base sm:text-lg font-bold mb-1 group-hover:text-purple-400 transition-colors truncate">
                                            {directory.name}
                                        </h3>
                                        <span className="text-xs text-white/60">{directory.platform}</span>
                                    </div>
                                    <div className={`flex items-center gap-1 ${getDAColor(directory.domain_authority)}`}>
                                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                                        <span className="text-xs sm:text-sm font-bold">{directory.domain_authority}</span>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-xs sm:text-sm text-white/60 mb-3 sm:mb-4 line-clamp-2">
                                    {directory.description}
                                </p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                                    {directory.best_for.slice(0, 3).map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-0.5 sm:py-1 rounded-lg bg-white/10 text-xs text-white/70"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between pt-3 sm:pt-4 border-t border-white/10">
                                    <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${getPricingColor(directory.pricing)} text-white`}>
                                        {directory.pricing}
                                    </span>
                                    <a
                                        href={directory.submission_url || directory.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-medium transition-all text-xs sm:text-sm"
                                    >
                                        Submit
                                        <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                    </a>
                                </div>

                                {/* Backlink Badge */}
                                <div className="mt-2 sm:mt-3">
                                    <span className={`text-xs px-2 py-0.5 rounded ${directory.backlink_type === 'dofollow' ? 'bg-green-500/20 text-green-300' : 'bg-gray-500/20 text-gray-300'}`}>
                                        {directory.backlink_type}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
