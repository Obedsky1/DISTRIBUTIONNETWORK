import { adminDb } from '@/lib/firebase/admin';
import { SEOPlatform, PlatformRedirect } from '@/types/platform';

// ─── In-memory cache ───
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
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

// ─── Query functions ───

export async function getAllPlatforms(): Promise<SEOPlatform[]> {
    const cached = getCached<SEOPlatform[]>('all_platforms');
    if (cached) return cached;

    if (!adminDb) return [];

    const snapshot = await adminDb.collection('platforms').get();
    const platforms = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as SEOPlatform[];

    return setCache('all_platforms', platforms);
}

export async function getPlatformBySlug(slug: string): Promise<SEOPlatform | null> {
    if (!slug || slug.startsWith('[')) return null; // Guard against undefined or template slugs

    const cacheKey = `platform_${slug}`;
    const cached = getCached<SEOPlatform | null>(cacheKey);
    if (cached !== null) return cached;

    if (!adminDb) return null;

    const snapshot = await adminDb
        .collection('platforms')
        .where('slug', '==', slug)
        .limit(1)
        .get();

    if (snapshot.empty) return null;

    const doc = snapshot.docs[0];
    const platform = { id: doc.id, ...doc.data() } as SEOPlatform;
    return setCache(cacheKey, platform);
}

export async function getPlatformsByCategory(category: string): Promise<SEOPlatform[]> {
    const all = await getAllPlatforms();
    return all.filter((p) => p.category?.toLowerCase() === category.toLowerCase());
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
    const platforms = await getAllPlatforms();
    return platforms.map((p) => p.slug).filter(Boolean);
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
        if (p.category) catSet.add(p.category.toLowerCase());
    });
    return Array.from(catSet).sort();
}

// ─── Redirects ───

export async function getAllRedirects(): Promise<PlatformRedirect[]> {
    const cached = getCached<PlatformRedirect[]>('all_redirects');
    if (cached) return cached;

    if (!adminDb) return [];

    const snapshot = await adminDb.collection('platform_redirects').get();
    const redirects = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as PlatformRedirect[];

    return setCache('all_redirects', redirects);
}

export async function getRedirectForSlug(oldSlug: string): Promise<string | null> {
    const redirects = await getAllRedirects();
    const redirect = redirects.find((r) => r.old_slug === oldSlug);
    return redirect?.new_slug || null;
}
