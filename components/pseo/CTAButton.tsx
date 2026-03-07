'use client';

interface CTAButtonProps {
    href: string;
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
                link_url: href,
            });
        }
    };

    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            onClick={handleClick}
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-lg shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300"
        >
            {label}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
        </a>
    );
}
