import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getCommunityBySlug, getAllCommunities, getRelatedCommunities, enrichCommunityForSEO } from '@/lib/community';
import CommunityDetailView from '@/components/community/CommunityDetailView';

interface Props {
    params: { slug: string };
}

export async function generateStaticParams() {
    const communities = await getAllCommunities();
    return communities.map((c) => ({
        slug: c.slug,
    }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const community = await getCommunityBySlug(params.slug);
    if (!community) return {};

    const enriched = enrichCommunityForSEO(community);

    const title = `${community.name} - Best ${community.platform} Community for ${community.niche || 'Founders'} | DistriBurst`;
    const description = community.shortDescription || community.description;
    const url = `https://distriburst.com/community/${community.slug}`;

    return {
        title,
        description,
        alternates: {
            canonical: community.canonicalSlug ? `https://distriburst.com/community/${community.canonicalSlug}` : url,
        },
        robots: enriched.robots,
        openGraph: {
            title,
            description,
            url,
            type: 'website',
            images: community.imageUrl ? [{ url: community.imageUrl }] : undefined,
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: community.imageUrl ? [community.imageUrl] : undefined,
        },
    };
}

export default async function CommunityPage({ params }: Props) {
    const community = await getCommunityBySlug(params.slug);

    if (!community) {
        notFound();
    }

    const enriched = enrichCommunityForSEO(community);
    const related = await getRelatedCommunities(enriched, 6);

    // Schema.org Structured Data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        mainEntity: {
            '@type': 'Organization',
            name: community.name,
            description: community.description,
            url: community.url,
            sameAs: [community.url],
        },
        breadcrumb: {
            '@type': 'BreadcrumbList',
            itemListElement: [
                {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://distriburst.com',
                },
                {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Communities',
                    item: 'https://distriburst.com/startup-communities',
                },
                {
                    '@type': 'ListItem',
                    position: 3,
                    name: community.name,
                    item: `https://distriburst.com/community/${community.slug}`,
                },
            ],
        },
    };

    // If FAQ exists, add FAQPage schema
    const faqSchema = community.faq && community.faq.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: community.faq.map(f => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: f.answer
            }
        }))
    } : null;

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            {faqSchema && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            )}
            <CommunityDetailView community={enriched} relatedCommunities={related} />
        </>
    );
}
