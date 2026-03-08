import { SITE_NAME, SITE_URL } from '@/lib/pseo/constants';

interface BreadcrumbItem {
    label: string;
    href: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
    const allItems = [{ label: 'Home', href: '/' }, ...items];

    // JSON-LD BreadcrumbList schema
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: allItems.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.label,
            item: item.href.startsWith('http') ? item.href : `${SITE_URL}${item.href}`,
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <nav aria-label="Breadcrumb" className="mb-6">
                <ol className="flex items-center gap-2 text-sm text-gray-400 flex-wrap">
                    {allItems.map((item, index) => (
                        <li key={item.href} className="flex items-center gap-2">
                            {index > 0 && (
                                <svg className="w-3 h-3 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            )}
                            {index === allItems.length - 1 ? (
                                <span className="text-gray-200 font-medium">{item.label}</span>
                            ) : (
                                <a
                                    href={item.href}
                                    className="hover:text-purple-400 transition-colors duration-200"
                                >
                                    {item.label}
                                </a>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
}
