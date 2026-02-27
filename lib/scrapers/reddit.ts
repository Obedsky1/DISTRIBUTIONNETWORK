import axios from 'axios';
import * as cheerio from 'cheerio';
import { Community, ActivityLevel } from '@/types';
import { generateEmbedding } from '@/lib/ai/gemini';

/**
 * Scrape public Reddit communities
 */
export async function scrapeRedditCommunities(limit = 100): Promise<Community[]> {
    try {
        const communities: Community[] = [];

        // Scrape popular subreddits from Reddit's public pages
        const popularSubreddits = await scrapePopularSubreddits(limit);

        for (const subreddit of popularSubreddits) {
            try {
                const community = await scrapeSubredditDetails(subreddit);
                if (community) {
                    communities.push(community);
                }

                // Rate limiting
                await sleep(1000);
            } catch (error) {
                console.error(`Error scraping subreddit ${subreddit}:`, error);
            }
        }

        console.log(`Scraped ${communities.length} Reddit communities`);
        return communities;
    } catch (error) {
        console.error('Error scraping Reddit communities:', error);
        throw error;
    }
}

/**
 * Scrape popular subreddits list
 */
async function scrapePopularSubreddits(limit: number): Promise<string[]> {
    try {
        // Use Reddit's public JSON API (no auth required)
        const response = await axios.get('https://www.reddit.com/subreddits/popular.json', {
            params: { limit },
            headers: {
                'User-Agent': 'CommunityMatchmaker/1.0',
            },
        });

        const subreddits = response.data.data.children.map(
            (child: any) => child.data.display_name
        );

        return subreddits;
    } catch (error) {
        console.error('Error fetching popular subreddits:', error);
        return [];
    }
}

/**
 * Scrape individual subreddit details
 */
async function scrapeSubredditDetails(subreddit: string): Promise<Community | null> {
    try {
        // Use Reddit's public JSON API
        const response = await axios.get(`https://www.reddit.com/r/${subreddit}/about.json`, {
            headers: {
                'User-Agent': 'CommunityMatchmaker/1.0',
            },
        });

        const data = response.data.data;

        // Skip NSFW communities
        if (data.over18) {
            return null;
        }

        const description = data.public_description || data.description || `r/${subreddit}`;
        const memberCount = data.subscribers || 0;
        const activityLevel = determineActivityLevel(memberCount, data.active_user_count || 0);

        // Extract categories and tags
        const categories = extractCategories(data);
        const tags = extractTags(subreddit, description);

        // Generate embedding
        const embeddingText = `${subreddit} ${description} ${tags.join(' ')}`;
        const embedding = await generateEmbedding(embeddingText);

        const community: Community = {
            id: `reddit_${subreddit}`,
            name: `r/${subreddit}`,
            platform: 'reddit',
            description: cleanDescription(description),
            category: categories,
            tags,
            memberCount,
            activityLevel,
            url: `https://www.reddit.com/r/${subreddit}`,
            imageUrl: data.icon_img || data.community_icon || undefined,
            embedding,
            lastIndexed: new Date(),
            metadata: {
                subreddit,
                verified: data.verified || false,
            },
            createdAt: new Date(data.created_utc * 1000),
            updatedAt: new Date(),
        };

        return community;
    } catch (error) {
        console.error(`Error scraping subreddit details for ${subreddit}:`, error);
        return null;
    }
}

/**
 * Determine activity level
 */
function determineActivityLevel(subscribers: number, activeUsers: number): ActivityLevel {
    const activeRatio = activeUsers / subscribers;

    if (subscribers > 100000 && activeRatio > 0.01) return 'high';
    if (subscribers > 10000 && activeRatio > 0.005) return 'high';
    if (subscribers > 1000 || activeRatio > 0.002) return 'medium';
    return 'low';
}

/**
 * Extract categories from subreddit data
 */
function extractCategories(data: any): string[] {
    const categories = new Set<string>();

    // Use subreddit type
    if (data.subreddit_type) {
        categories.add(data.subreddit_type);
    }

    // Use advertiser category
    if (data.advertiser_category) {
        categories.add(data.advertiser_category.toLowerCase());
    }

    // Default
    if (categories.size === 0) {
        categories.add('discussion');
    }

    return Array.from(categories).slice(0, 5);
}

/**
 * Extract tags from name and description
 */
function extractTags(name: string, description: string): string[] {
    const text = `${name} ${description}`.toLowerCase();
    const tags = new Set<string>();

    const keywords = [
        'gaming',
        'tech',
        'programming',
        'science',
        'art',
        'music',
        'news',
        'sports',
        'memes',
        'discussion',
        'support',
        'learning',
        'advice',
        'funny',
        'politics',
        'finance',
        'crypto',
        'health',
        'fitness',
        'food',
    ];

    keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
            tags.add(keyword);
        }
    });

    return Array.from(tags).slice(0, 10);
}

/**
 * Clean description text
 */
function cleanDescription(description: string): string {
    // Remove markdown and excessive whitespace
    return description
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
        .replace(/[*_~`]/g, '') // Remove markdown formatting
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim()
        .slice(0, 500); // Limit length
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
