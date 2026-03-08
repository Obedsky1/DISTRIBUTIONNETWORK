'use client';

// ─── CTA Button Component ───

interface CTAButtonProps {
    href?: string; // Kept for prop compatibility but will be overridden for internal flow if requested
    label: string;
    platformName: string;
}

export default function CTAButton({ href, label, platformName }: CTAButtonProps) {
    const handleClick = () => {
        // GA4 event tracking
        if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'cta_click', {
                event_category: 'SEO',
                event_label: platformName,
                link_url: '/auth/signup',
            });
        }
    };

    return (
        <a
            href="/auth?mode=signup&redirect=/workspace"
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300 group relative z-10 cursor-pointer"
        >
            {label}
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
        </a>
    );
}
