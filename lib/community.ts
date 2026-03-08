import { Community } from '@/types';
import communitiesData from '@/data/communities.json';
import { adminDb } from '@/lib/firebase/admin';
import { isCommunityIndexable, getCommunityPageQualityScore } from './pseo/community-quality';

/**
 * Fetches all communities from JSON and Firestore.
 */
export async function getAllCommunities(): Promise<Community[]> {
    // 1. Load from JSON
    const jsonCommunities = (communitiesData.communities as any[]).map(c => ({
        ...c,
        category: c.category || c.categories || [],
        slug: c.slug || c.id || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        createdAt: c.createdAt ? new Date(c.createdAt) : new Date(),
        updatedAt: c.updatedAt ? new Date(c.updatedAt) : new Date(),
    })) as Community[];

    // 2. Load from Firestore
    let firestoreCommunities: Community[] = [];
    if (adminDb && process.env.DISABLE_FIRESTORE_FETCH !== 'true' && process.env.NEXT_PHASE !== 'phase-production-build') {
        try {
            const snapshot = await adminDb.collection('communities').get();
            firestoreCommunities = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt || Date.now()),
                    updatedAt: data.updatedAt?.toDate?.() || new Date(data.updatedAt || Date.now()),
                } as Community;
            });
        } catch (error) {
            console.error('Error fetching communities from Firestore:', error);
        }
    }

    // Merge and deduplicate by slug
    const communities = [...jsonCommunities];
    const seenSlugs = new Set(communities.map(c => c.slug));

    firestoreCommunities.forEach(fc => {
        if (!seenSlugs.has(fc.slug)) {
            communities.push(fc);
            seenSlugs.add(fc.slug);
        }
    });

    return communities;
}

/**
 * Fetches a single community by slug.
 */
export async function getCommunityBySlug(slug: string): Promise<Community | null> {
    const all = await getAllCommunities();
    return all.find(c => c.slug === slug) || null;
}

/**
 * Fetches related communities.
 */
export async function getRelatedCommunities(community: Community, limit: number = 6): Promise<Community[]> {
    const all = await getAllCommunities();

    // First, try explicitly linked slugs
    if (community.relatedCommunitySlugs && community.relatedCommunitySlugs.length > 0) {
        const linked = all.filter(c => community.relatedCommunitySlugs?.includes(c.slug!));
        if (linked.length >= limit) return linked.slice(0, limit);

        // Fill remaining with category matches
        const others = all.filter(c =>
            c.id !== community.id &&
            !community.relatedCommunitySlugs?.includes(c.slug!) &&
            (c.category || []).some(cat => (community.category || []).includes(cat))
        );
        return [...linked, ...others].slice(0, limit);
    }

    // Otherwise, match by category/platform
    return all
        .filter(c => c.id !== community.id && (c.category || []).some(cat => (community.category || []).includes(cat)))
        .slice(0, limit);
}

/**
 * Enriches a community object with calculated SEO metadata and quality flags.
 */
export function enrichCommunityForSEO(community: Community) {
    const qualityScore = getCommunityPageQualityScore(community);
    const indexable = isCommunityIndexable(community);

    return {
        ...community,
        qualityScore,
        indexable,
        robots: indexable ? 'index, follow' : 'noindex, follow'
    };
}
