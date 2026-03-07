import { SEOPlatform, ComparisonPair } from '@/types/platform';
import { MAX_COMPARISONS_PER_CATEGORY } from './constants';

/**
 * Generate comparison pairs from platforms.
 * Rules:
 * - Only compare within same category/type
 * - Limit to top N platforms per category (by DA)
 * - Generate only one direction (alphabetical) to prevent duplicates
 */
export function generateComparisonPairs(platforms: SEOPlatform[]): ComparisonPair[] {
    const pairs: ComparisonPair[] = [];
    const seen = new Set<string>();

    // Group by category
    const byCategory = new Map<string, SEOPlatform[]>();
    for (const p of platforms) {
        const key = `${p.type}_${p.category?.toLowerCase() || 'uncategorized'}`;
        if (!byCategory.has(key)) byCategory.set(key, []);
        byCategory.get(key)!.push(p);
    }

    for (const [, group] of byCategory) {
        // Sort by DA descending, take top N
        const top = group
            .sort((a, b) => (b.domainAuthority || 0) - (a.domainAuthority || 0))
            .slice(0, MAX_COMPARISONS_PER_CATEGORY);

        // Generate pairs (i, j) where i < j alphabetically
        for (let i = 0; i < top.length; i++) {
            for (let j = i + 1; j < top.length; j++) {
                const [a, b] = [top[i], top[j]].sort((x, y) =>
                    x.slug.localeCompare(y.slug)
                );

                const combinedSlug = `${a.slug}-vs-${b.slug}`;
                if (seen.has(combinedSlug)) continue;
                seen.add(combinedSlug);

                pairs.push({
                    slugA: a.slug,
                    slugB: b.slug,
                    nameA: a.name,
                    nameB: b.name,
                    category: a.category || 'general',
                    combinedSlug,
                });
            }
        }
    }

    return pairs;
}

/**
 * Parse a comparison slug like "product-hunt-vs-beta-list" to extract the two slugs.
 * Returns null if the format is invalid.
 */
export function parseComparisonSlug(combinedSlug: string): { slugA: string; slugB: string } | null {
    const vsIndex = combinedSlug.indexOf('-vs-');
    if (vsIndex === -1) return null;

    const slugA = combinedSlug.substring(0, vsIndex);
    const slugB = combinedSlug.substring(vsIndex + 4);

    if (!slugA || !slugB) return null;
    return { slugA, slugB };
}
