import { adminDb } from '@/lib/firebase/admin';
import { SEOPlatform, PlatformRedirect } from '@/types/platform';

// ─── In-memory cache ───
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const CACHE_TTL = process.env.NODE_ENV === 'development'
    ? 60 * 60 * 1000 // 1 hour in development to save quota
    : 5 * 60 * 1000; // 5 minutes in production
const cache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string): T | null {
    const entry = cache.get(key);
    if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
        return entry.data as T;
    }
    cache.delete(key);
    return null;
}

function setCache<T>(key: string, data: T): T {
    cache.set(key, { data, timestamp: Date.now() });
    return data;
}

import { cache as reactCache } from 'react';

// ─── Query functions ───

import communitiesData from '@/data/communities.json';
import directoriesData from '@/data/directories.json';

// ─── Transformation Helpers ───

function transformCommunityToSEO(c: any): SEOPlatform {
    const isGroup = ['Discord', 'Telegram', 'Slack', 'WhatsApp', 'Facebook'].some(p =>
        c.platform?.toLowerCase().includes(p.toLowerCase())
    );
    return {
        id: c.id,
        name: c.name,
        slug: c.slug || c.id || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: isGroup ? 'group' : 'community',
        category: (c.categories && c.categories.length > 0) ? c.categories[0] : (c.category || 'Uncategorized'),
        description: c.description || '',
        domainAuthority: 0,
        backlinkType: 'none',
        submissionLink: c.url || c.invite_link || '',
        tags: [c.platform, ...(c.categories || [])].filter(Boolean),
        createdAt: new Date().toISOString(),
        pricing: 'Free',
        approval_time: 'Instant',
        requirements: [],
        submission_steps: [],
        rules: '',
        best_time_to_post: '',
        audience: c.use_cases?.join(', ') || '',
        geo_focus: 'Global',
        contact_or_support_link: '',
        last_verified_at: new Date().toISOString(),
    };
}

function transformDirectoryToSEO(d: any): SEOPlatform {
    return {
        id: d.id,
        name: d.name,
        slug: d.slug || d.id || d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        type: 'directory',
        category: d.category || 'Directory',
        description: d.description || '',
        domainAuthority: d.domain_authority || 0,
        backlinkType: 'none',
        submissionLink: d.submission_url || d.url || '',
        tags: [d.category].filter(Boolean),
        createdAt: new Date().toISOString(),
        pricing: d.pricing || 'Free',
        approval_time: 'Varies',
        requirements: [],
        submission_steps: [],
        rules: '',
        best_time_to_post: '',
        audience: '',
        geo_focus: 'Global',
        contact_or_support_link: '',
        last_verified_at: new Date().toISOString(),
    };
}

/**
 * Get all platforms with minimal fields for listing pages.
 * Deduplicated via reactCache for Server Components.
 */
export const getAllPlatforms = reactCache(async function (): Promise<SEOPlatform[]> {
    const cached = getCached<SEOPlatform[]>('all_platforms_minimal');
    if (cached) return cached;

    // Load from JSON
    const jsonCommunities = (communitiesData.communities as any[]).map(transformCommunityToSEO);
    const jsonDirectories = (directoriesData.directories as any[]).map(transformDirectoryToSEO);

    let platforms: SEOPlatform[] = [...jsonCommunities, ...jsonDirectories];

    // Merge from Firestore if available
    if (adminDb && process.env.DISABLE_FIRESTORE_FETCH !== 'true') {
        try {
            // Fetch ONLY fields needed for listings/cards to save quota and bandwidth
            const snapshot = await adminDb.collection('platforms')
                .select(
                    'id', 'name', 'slug', 'type', 'category', 'domainAuthority',
                    'pricing', 'tags', 'backlinkType', 'approval_time', 'geo_focus'
                )
                .get();

            const firestorePlatforms = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as SEOPlatform[];

            // Avoid duplicates by slug
            const seenSlugs = new Set(platforms.map(p => p.slug));
            firestorePlatforms.forEach(fp => {
                if (!seenSlugs.has(fp.slug)) {
                    platforms.push(fp);
                    seenSlugs.add(fp.slug);
                }
            });
        } catch (error: any) {
            console.error('Error fetching platforms from Firestore (likely quota):', error.message || error);
            if (error.code === 8 || error.message?.includes('Quota')) {
                console.warn('Firestore Quota Exceeded. Falling back to static JSON data only.');
            }
        }
    }

    return setCache('all_platforms_minimal', platforms);
});

/**
 * Get a single platform with ALL fields for the detail page.
 */
export const getPlatformBySlug = reactCache(async function (slug: string): Promise<SEOPlatform | null> {
    if (!slug || slug.startsWith('[')) return null;

    const cacheKey = `platform_full_${slug}`;
    const cached = getCached<SEOPlatform | null>(cacheKey);
    if (cached !== null) return cached;

    // First try the JSON data
    const isJsonPlatform = (communitiesData.communities as any[]).some(c => c.id === slug || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug) ||
        (directoriesData.directories as any[]).some(d => d.id === slug || d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug);

    if (isJsonPlatform) {
        const allMinimal = await getAllPlatforms();
        const minimal = allMinimal.find((p) => p.slug === slug);
        if (minimal) return setCache(cacheKey, minimal);
    }

    // Fallback to direct Firestore query for full document
    if (!adminDb || process.env.DISABLE_FIRESTORE_FETCH === 'true') return null;

    try {
        // Optimization: First check if we have the Firestore ID from the minimal list
        const allMinimal = await getAllPlatforms();
        const minimal = allMinimal.find((p) => p.slug === slug);

        // If we have minimal info and it has an ID that looks like a Firestore ID (usually random string vs slug-like)
        // Or we just try to fetch by slug directly but with a limit of 1
        const snapshot = await adminDb
            .collection('platforms')
            .where('slug', '==', slug)
            .limit(1)
            .get();

        if (snapshot.empty) return minimal || null;

        const doc = snapshot.docs[0];
        const platform = { id: doc.id, ...doc.data() } as SEOPlatform;
        return setCache(cacheKey, platform);
    } catch (error) {
        console.error(`Error in getPlatformBySlug for slug "${slug}":`, error);
        // Try fallback to minimal if available
        const allMinimal = await getAllPlatforms();
        return allMinimal.find((p) => p.slug === slug) || null;
    }
});

export async function getPlatformsByCategory(category: string): Promise<SEOPlatform[]> {
    const all = await getAllPlatforms();
    return all.filter((p) => (p.category || '').toLowerCase() === (category || '').toLowerCase());
}

export async function getPlatformsByType(type: string): Promise<SEOPlatform[]> {
    const all = await getAllPlatforms();
    return all.filter((p) => p.type === type);
}

export async function getPlatformsByTypeAndFilter(type: string, filter?: string): Promise<SEOPlatform[]> {
    const all = await getAllPlatforms();
    return all.filter((p) => {
        const typeMatch = p.type === type;
        if (!filter) return typeMatch;
        // For platform-specific filters like telegram, discord, slack
        const nameMatch = p.name?.toLowerCase().includes(filter.toLowerCase());
        const tagMatch = p.tags?.some((t) => t.toLowerCase().includes(filter.toLowerCase()));
        const descMatch = p.description?.toLowerCase().includes(filter.toLowerCase());
        return typeMatch && (nameMatch || tagMatch || descMatch);
    });
}

export async function getPlatformsByTag(tag: string): Promise<SEOPlatform[]> {
    const all = await getAllPlatforms();
    return all.filter((p) => p.tags?.some((t) => t.toLowerCase() === tag.toLowerCase()));
}

export async function getPlatformsByGeo(geo: string): Promise<SEOPlatform[]> {
    const all = await getAllPlatforms();
    return all.filter((p) => p.geo_focus?.toLowerCase().includes(geo.toLowerCase()));
}

export async function getPlatformsByAudience(audience: string[]): Promise<SEOPlatform[]> {
    const all = await getAllPlatforms();
    return all.filter((p) =>
        audience.some(
            (a) =>
                p.audience?.toLowerCase().includes(a.toLowerCase()) ||
                p.tags?.some((t) => t.toLowerCase().includes(a.toLowerCase())) ||
                p.category?.toLowerCase().includes(a.toLowerCase())
        )
    );
}

export async function getAllSlugs(): Promise<string[]> {
    const cached = getCached<string[]>('all_slugs');
    if (cached) return cached;

    // Get from JSON
    const jsonCommunitiesSlugs = (communitiesData.communities as any[]).map(c => c.slug || c.id || c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    const jsonDirectoriesSlugs = (directoriesData.directories as any[]).map(d => d.slug || d.id || d.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
    const slugs = new Set([...jsonCommunitiesSlugs, ...jsonDirectoriesSlugs]);

    // Merge from Firestore (optimized select)
    if (adminDb && process.env.DISABLE_FIRESTORE_FETCH !== 'true') {
        try {
            const snapshot = await adminDb.collection('platforms').select('slug').get();
            snapshot.docs.forEach(doc => {
                const s = doc.get('slug');
                if (s) slugs.add(s);
            });
        } catch (error) {
            console.error('Error fetching slugs from Firestore:', error);
        }
    }

    return setCache('all_slugs', Array.from(slugs).filter(Boolean));
}

export async function getAllTags(): Promise<string[]> {
    const platforms = await getAllPlatforms();
    const tagSet = new Set<string>();
    platforms.forEach((p) => p.tags?.forEach((t) => tagSet.add(t.toLowerCase())));
    return Array.from(tagSet).sort();
}

export async function getAllGeoLocations(): Promise<string[]> {
    const platforms = await getAllPlatforms();
    const geoSet = new Set<string>();
    platforms.forEach((p) => {
        if (p.geo_focus) {
            // Split by comma for multi-geo platforms like "usa, uk"
            p.geo_focus.split(',').forEach((g) => {
                const trimmed = g.trim().toLowerCase();
                if (trimmed && trimmed !== 'global') geoSet.add(trimmed);
            });
        }
    });
    return Array.from(geoSet).sort();
}

export async function getAllCategories(): Promise<string[]> {
    const platforms = await getAllPlatforms();
    const catSet = new Set<string>();
    platforms.forEach((p) => {
        if (p.category && typeof p.category === 'string') catSet.add(p.category.toLowerCase());
    });
    return Array.from(catSet).sort();
}

// ─── Redirects ───

export async function getAllRedirects(): Promise<PlatformRedirect[]> {
    const cached = getCached<PlatformRedirect[]>('all_redirects');
    if (cached) return cached;

    if (!adminDb || process.env.DISABLE_FIRESTORE_FETCH === 'true') return [];

    try {
        // Optimized select
        const snapshot = await adminDb.collection('platform_redirects')
            .select('old_slug', 'new_slug')
            .get();

        const redirects = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...(doc.data() as any),
        })) as PlatformRedirect[];

        return setCache('all_redirects', redirects);
    } catch (error) {
        console.error('Error fetching redirects:', error);
        return [];
    }
}

export async function getRedirectForSlug(oldSlug: string): Promise<string | null> {
    const redirects = await getAllRedirects();
    const redirect = redirects.find((r) => r.old_slug === oldSlug);
    return redirect?.new_slug || null;
}
