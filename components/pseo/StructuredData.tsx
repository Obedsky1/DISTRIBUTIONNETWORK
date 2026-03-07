import { SITE_URL, SITE_NAME } from '@/lib/pseo/constants';
import { SEOPlatform } from '@/types/platform';

// ─── Generic JSON-LD renderer ───
interface JsonLdProps {
    data: Record<string, any>;
}

export function JsonLd({ data }: JsonLdProps) {
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
        />
    );
}

// ─── WebPage schema ───
export function WebPageSchema({
    title,
    description,
    url,
}: {
    title: string;
    description: string;
    url: string;
}) {
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'WebPage',
                name: title,
                description,
                url: `${SITE_URL}${url}`,
                isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
            }}
        />
    );
}

// ─── Organization schema ───
export function OrganizationSchema() {
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: SITE_NAME,
                url: SITE_URL,
                logo: `${SITE_URL}/logo-seo.png`,
                contactPoint: {
                    '@type': 'ContactPoint',
                    email: 'support@distriburst.com',
                    contactType: 'customer service'
                },
                sameAs: [
                    'https://twitter.com/distriburst',
                    'https://linkedin.com/company/distriburst'
                ],
            }}
        />
    );
}

// ─── WebSite + SearchAction schema ───
export function WebSiteSchema() {
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: SITE_NAME,
                url: SITE_URL,
                potentialAction: {
                    '@type': 'SearchAction',
                    target: `${SITE_URL}/search?q={search_term_string}`,
                    'query-input': 'required name=search_term_string',
                },
            }}
        />
    );
}

// ─── FAQPage schema ───
export function FAQSchema({ faqs }: { faqs: { question: string; answer: string }[] }) {
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: faqs.map((f) => ({
                    '@type': 'Question',
                    name: f.question,
                    acceptedAnswer: {
                        '@type': 'Answer',
                        text: f.answer,
                    },
                })),
            }}
        />
    );
}

// ─── ItemList schema ───
export function ItemListSchema({
    items,
    name,
}: {
    items: { name: string; url: string; position: number }[];
    name: string;
}) {
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'ItemList',
                name,
                itemListElement: items.map((item) => ({
                    '@type': 'ListItem',
                    position: item.position,
                    name: item.name,
                    url: `${SITE_URL}${item.url}`,
                })),
            }}
        />
    );
}

// ─── BreadcrumbList schema ───
export function BreadcrumbListSchema({
    items,
}: {
    items: { name: string; url: string; position: number }[];
}) {
    return (
        <JsonLd
            data={{
                '@context': 'https://schema.org',
                '@type': 'BreadcrumbList',
                itemListElement: items.map((item) => ({
                    '@type': 'ListItem',
                    position: item.position,
                    name: item.name,
                    item: `${SITE_URL}${item.url}`,
                })),
            }}
        />
    );
}

// ─── Platform-specific FAQ generator ───
export function generatePlatformFAQs(platform: SEOPlatform): { question: string; answer: string }[] {
    const faqs: { question: string; answer: string }[] = [];

    faqs.push({
        question: `What is ${platform.name}?`,
        answer: platform.description || `${platform.name} is a ${platform.type} in the ${platform.category} category.`,
    });

    if (platform.pricing) {
        faqs.push({
            question: `Is ${platform.name} free?`,
            answer: platform.pricing.toLowerCase() === 'free'
                ? `Yes, ${platform.name} is free to use.`
                : `${platform.name} pricing is: ${platform.pricing}.`,
        });
    }

    if (platform.approval_time) {
        faqs.push({
            question: `How long does it take to get approved on ${platform.name}?`,
            answer: `The typical approval time for ${platform.name} is ${platform.approval_time}.`,
        });
    }

    if (platform.backlinkType) {
        faqs.push({
            question: `Does ${platform.name} provide backlinks?`,
            answer: `${platform.name} provides ${platform.backlinkType} backlinks.`,
        });
    }

    if (platform.audience) {
        faqs.push({
            question: `Who is the target audience of ${platform.name}?`,
            answer: `${platform.name} targets ${platform.audience}.`,
        });
    }

    return faqs;
}
