import { SEOPlatform, InternalLinks } from '@/types/platform';
import { PERSONAS, USE_CASES } from './constants';

/**
 * Generate internal links for a platform page.
 * Returns related platforms, communities, directories, and cross-page links.
 */
export function generateInternalLinks(
    platform: SEOPlatform,
    allPlatforms: SEOPlatform[]
): InternalLinks {
    const others = allPlatforms.filter((p) => p.slug !== platform.slug);

    // Related platforms: same category or overlapping tags
    const relatedPlatforms = findRelated(platform, others, 5);

    // Related communities: platforms of type 'community' or 'group'
    const relatedCommunities = others
        .filter((p) => p.type === 'community' || p.type === 'group')
        .filter((p) => hasOverlap(platform.tags, p.tags) || p.category === platform.category)
        .slice(0, 3)
        .map(pick);

    // Alternative directories: other directories in same category
    const alternativeDirectories = others
        .filter((p) => p.type === 'directory' && p.category === platform.category)
        .slice(0, 2)
        .map(pick);

    // Category page link
    const categoryPage = getCategoryPageSlug(platform);

    // Comparison page links
    const comparisonPages = relatedPlatforms
        .filter((p) => p.type === platform.type)
        .slice(0, 3)
        .map((p) => {
            const [a, b] = [platform.slug, p.slug].sort();
            return {
                slug: `${a}-vs-${b}`,
                label: `${platform.name} vs ${p.name}`,
            };
        });

    // Persona page links
    const personaPages = PERSONAS.filter((persona) =>
        persona.audienceMatch.some(
            (a) =>
                platform.audience?.toLowerCase().includes(a) ||
                platform.tags?.some((t) => t.toLowerCase().includes(a))
        )
    ).map((p) => ({ slug: p.slug, label: `For ${p.label}` }));

    // Use-case page links
    const useCasePages = USE_CASES.filter((uc) =>
        uc.categoryMatch.some(
            (c) =>
                platform.category?.toLowerCase().includes(c) ||
                platform.tags?.some((t) => t.toLowerCase().includes(c))
        )
    ).map((u) => ({ slug: u.slug, label: u.label }));

    return {
        relatedPlatforms,
        relatedCommunities,
        alternativeDirectories,
        categoryPage,
        comparisonPages,
        personaPages,
        useCasePages,
    };
}

// ─── Helpers ───

function findRelated(
    platform: SEOPlatform,
    others: SEOPlatform[],
    count: number
): Pick<SEOPlatform, 'name' | 'slug' | 'type'>[] {
    // Score each platform by relevance
    const scored = others.map((p) => {
        let score = 0;
        if (p.category === platform.category) score += 3;
        if (p.type === platform.type) score += 2;
        score += countOverlap(platform.tags, p.tags);
        return { platform: p, score };
    });

    return scored
        .sort((a, b) => b.score - a.score)
        .slice(0, count)
        .map((s) => pick(s.platform));
}

function pick(p: SEOPlatform): Pick<SEOPlatform, 'name' | 'slug' | 'type'> {
    return { name: p.name, slug: p.slug, type: p.type };
}

function hasOverlap(a?: string[], b?: string[]): boolean {
    if (!a || !b) return false;
    const setB = new Set(b.map((s) => s.toLowerCase()));
    return a.some((s) => setB.has(s.toLowerCase()));
}

function countOverlap(a?: string[], b?: string[]): number {
    if (!a || !b) return 0;
    const setB = new Set(b.map((s) => s.toLowerCase()));
    return a.filter((s) => setB.has(s.toLowerCase())).length;
}

function getCategoryPageSlug(platform: SEOPlatform): string | null {
    if (platform.type === 'directory') return '/startup-directories';
    if (platform.type === 'community') return '/startup-communities';
    if (platform.type === 'group') {
        const name = platform.name?.toLowerCase() || '';
        const tags = platform.tags?.map((t) => t.toLowerCase()) || [];
        if (name.includes('telegram') || tags.includes('telegram')) return '/startup-telegram-groups';
        if (name.includes('discord') || tags.includes('discord')) return '/startup-discord-groups';
        if (name.includes('slack') || tags.includes('slack')) return '/startup-slack-groups';
        return '/startup-communities';
    }
    return null;
}
