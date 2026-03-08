import { Community, User, RecommendationResult } from '@/types';
import { cosineSimilarity } from './gemini';
import { queryDocuments } from '@/lib/firebase/firestore';

/**
 * Get personalized community recommendations for a user
 */
export async function getRecommendations(
    user: User,
    limit = 20,
    excludeIds: string[] = []
): Promise<RecommendationResult[]> {
    try {
        // If user has no interest embedding, return popular communities
        if (!user.interestEmbedding || user.interestEmbedding.length === 0) {
            return getPopularCommunities(limit, excludeIds);
        }

        // Fetch all communities (in production, you'd want to optimize this with vector search)
        const allCommunities = await queryDocuments<Community>('communities', [
            { field: 'embedding', operator: '!=', value: null },
        ]);

        // Filter out excluded communities
        const communities = allCommunities.filter(
            (c) => !excludeIds.includes(c.id) && c.embedding && c.embedding.length > 0
        );

        // Calculate similarity scores
        const scored = communities.map((community) => {
            const score = cosineSimilarity(user.interestEmbedding, community.embedding);
            return {
                community,
                matchScore: score,
                reason: generateRecommendationReason(user, community, score),
            };
        });

        // Apply diversity and freshness boosting
        const boosted = applyDiversityBoost(scored, user);

        // Sort by score and limit
        return boosted.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
    } catch (error) {
        console.error('Error getting recommendations:', error);
        throw new Error('Failed to get recommendations');
    }
}

/**
 * Get popular communities (fallback for new users)
 */
async function getPopularCommunities(
    limit: number,
    excludeIds: string[]
): Promise<RecommendationResult[]> {
    const communities = await queryDocuments<Community>(
        'communities',
        [],
        'memberCount',
        'desc',
        limit * 2
    );

    return communities
        .filter((c) => !excludeIds.includes(c.id))
        .slice(0, limit)
        .map((community) => ({
            community,
            matchScore: 0.5,
            reason: 'Popular community',
        }));
}

/**
 * Apply diversity boost to recommendations
 */
function applyDiversityBoost(
    recommendations: RecommendationResult[],
    user: User
): RecommendationResult[] {
    const platformCounts: Record<string, number> = {};
    const categoryCounts: Record<string, number> = {};

    return recommendations.map((rec) => {
        let boost = 1.0;

        // Penalize over-represented platforms
        const platformCount = platformCounts[rec.community.platform] || 0;
        platformCounts[rec.community.platform] = platformCount + 1;
        if (platformCount > 3) {
            boost *= 0.9;
        }

        // Penalize over-represented categories
        (rec.community.category || []).forEach((cat) => {
            const catCount = categoryCounts[cat] || 0;
            categoryCounts[cat] = catCount + 1;
            if (catCount > 2) {
                boost *= 0.95;
            }
        });

        // Boost preferred platforms
        if (user.preferences.platforms.includes(rec.community.platform)) {
            boost *= 1.1;
        }

        // Boost preferred activity level
        if (
            user.preferences.activityLevel !== 'any' &&
            rec.community.activityLevel === user.preferences.activityLevel
        ) {
            boost *= 1.05;
        }

        // Boost recently indexed communities (freshness)
        const daysSinceIndexed =
            (Date.now() - new Date(rec.community.lastIndexed).getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceIndexed < 1) {
            boost *= 1.1;
        }

        return {
            ...rec,
            matchScore: Math.min(rec.matchScore * boost, 1.0),
        };
    });
}

/**
 * Generate a human-readable reason for the recommendation
 */
function generateRecommendationReason(
    user: User,
    community: Community,
    score: number
): string {
    const reasons: string[] = [];

    // Check interest overlap
    const matchingInterests = user.interests.filter((interest) =>
        community.tags.some((tag) => tag.toLowerCase().includes(interest.toLowerCase()))
    );

    if (matchingInterests.length > 0) {
        reasons.push(`Matches your interests: ${matchingInterests.slice(0, 2).join(', ')}`);
    }

    // Check category preferences
    const matchingCategories = (community.category || []).filter((cat) =>
        (user.preferences.categories || []).includes(cat)
    );

    if (matchingCategories.length > 0) {
        reasons.push(`In your preferred categories`);
    }

    // Activity level match
    if (
        user.preferences.activityLevel !== 'any' &&
        community.activityLevel === user.preferences.activityLevel
    ) {
        reasons.push(`${community.activityLevel} activity level`);
    }

    // High similarity score
    if (score > 0.8) {
        reasons.push('Highly relevant to your profile');
    }

    return reasons.length > 0 ? reasons.join(' • ') : 'Recommended for you';
}

/**
 * Get similar communities based on a specific community
 */
export async function getSimilarCommunities(
    communityId: string,
    limit = 10
): Promise<RecommendationResult[]> {
    try {
        const community = await queryDocuments<Community>('communities', [
            { field: 'id', operator: '==', value: communityId },
        ]);

        if (!community[0] || !community[0].embedding) {
            throw new Error('Community not found or has no embedding');
        }

        const targetCommunity = community[0];
        const allCommunities = await queryDocuments<Community>('communities', [
            { field: 'embedding', operator: '!=', value: null },
        ]);

        const scored = allCommunities
            .filter((c) => c.id !== communityId && c.embedding && c.embedding.length > 0)
            .map((c) => ({
                community: c,
                matchScore: cosineSimilarity(targetCommunity.embedding, c.embedding),
                reason: 'Similar community',
            }));

        return scored.sort((a, b) => b.matchScore - a.matchScore).slice(0, limit);
    } catch (error) {
        console.error('Error getting similar communities:', error);
        throw new Error('Failed to get similar communities');
    }
}
