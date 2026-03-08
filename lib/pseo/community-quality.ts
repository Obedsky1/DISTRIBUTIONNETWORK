import { Community } from '@/types';

export const QUALITY_THRESHOLD = 50;

/**
 * Calculates a quality score for a community detail page.
 * Scoring factors:
 * - Number of meaningful populated sections
 * - Unique descriptive content length
 * - Presence of unique rules/strategy/FAQ
 * - Related links presence
 */
export function getCommunityPageQualityScore(community: Community): number {
    let score = 0;

    // 1. Basic Content Check (Max 20 points)
    if (community.description && community.description.length > 100) score += 10;
    if (community.longDescription && community.longDescription.length > 300) score += 10;

    // 2. Meaningful Sections (Max 40 points)
    const sections = [
        'whyJoin',
        'whoShouldUseIt',
        'stageFit',
        'selfPromoPolicy',
        'postingRules',
        'whatWorksBest',
        'founderStrategy'
    ];

    sections.forEach(field => {
        if ((community as any)[field] && (community as any)[field].length > 50) {
            score += 5;
        }
    });

    if (community.faq && community.faq.length >= 2) score += 5;

    // 3. Structured Data (Max 20 points)
    if (community.pros && community.pros.length >= 3) score += 5;
    if (community.cons && community.cons.length >= 2) score += 5;
    if (community.tags && community.tags.length >= 5) score += 5;
    if (community.relatedCommunitySlugs && community.relatedCommunitySlugs.length >= 3) score += 5;

    // 4. Uniqueness Check (Max 20 points)
    // Avoid generic fluffy descriptions
    const fluffKeywords = ['great for founders', 'network and grow', 'helpful community'];
    const lowerDesc = (community.description || '').toLowerCase();
    const fluffCount = fluffKeywords.filter(k => lowerDesc.includes(k)).length;
    score -= fluffCount * 2;

    if (community.qualityScore !== undefined) {
        // If scorecard is already calculated, we can blend it or use it
        return Math.max(0, Math.min(100, (score + community.qualityScore) / 2));
    }

    return Math.max(0, Math.min(100, score));
}

/**
 * Determines if a community page should be indexable.
 */
export function isCommunityIndexable(community: Community): boolean {
    // Force indexable if explicitly set
    if (community.indexable === true) return true;
    if (community.indexable === false) return false;

    const score = getCommunityPageQualityScore(community);

    // Minimum thresholds for indexing
    const hasEnoughSections = [
        community.whyJoin,
        community.whoShouldUseIt,
        community.selfPromoPolicy,
        community.whatWorksBest,
        community.faq
    ].filter(Boolean).length >= 3;

    return score >= QUALITY_THRESHOLD && hasEnoughSections;
}

/**
 * Checks for similarity between two communities to prevent duplicate content indexing.
 */
export function getSimilarityScore(c1: Community, c2: Community): number {
    let similarity = 0;

    // Platform + Niche + Audience similarity
    if (c1.platform === c2.platform) similarity += 20;
    if (c1.niche === c2.niche && c1.niche) similarity += 30;
    if (c1.audience === c2.audience && c1.audience) similarity += 20;

    // Text similarity (naive check)
    if (c1.description && c2.description) {
        const words1 = new Set(c1.description.toLowerCase().split(' '));
        const words2 = new Set(c2.description.toLowerCase().split(' '));
        const intersection = new Set([...words1].filter(x => words2.has(x)));
        const union = new Set([...words1, ...words2]);
        const textSimilarity = (intersection.size / union.size) * 30;
        similarity += textSimilarity;
    }

    return similarity;
}
