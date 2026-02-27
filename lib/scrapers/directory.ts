import axios from 'axios';
import * as cheerio from 'cheerio';
import { Community, ActivityLevel } from '@/types';
import { generateEmbedding } from '@/lib/ai/gemini';

/**
 * Scrape community directories (Disboard, Top.gg, etc.)
 */
export async function scrapeDirectories(limit = 100): Promise<Community[]> {
    const communities: Community[] = [];

    try {
        // Scrape from multiple directory sources
        const disboard = await scrapeDisboard(Math.floor(limit / 2));
        const topgg = await scrapeTopGG(Math.floor(limit / 2));

        communities.push(...disboard, ...topgg);

        console.log(`Scraped ${communities.length} communities from directories`);
        return communities;
    } catch (error) {
        console.error('Error scraping directories:', error);
        throw error;
    }
}

/**
 * Scrape Disboard (Discord server directory)
 */
async function scrapeDisboard(limit: number): Promise<Community[]> {
    const communities: Community[] = [];

    try {
        const response = await axios.get('https://disboard.org/servers', {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        const $ = cheerio.load(response.data);

        const servers = $('.server-card').slice(0, limit);

        for (let i = 0; i < servers.length; i++) {
            try {
                const server = servers.eq(i);

                const name = server.find('.server-name').text().trim();
                const description = server.find('.server-description').text().trim();
                const memberCountText = server.find('.server-members').text().trim();
                const memberCount = parseMemberCount(memberCountText);
                const url = 'https://disboard.org' + server.find('a').attr('href');

                // Extract categories from tags
                const categories: string[] = [];
                server.find('.server-tag').each((_, tag) => {
                    categories.push($(tag).text().trim().toLowerCase());
                });

                const tags = extractTags(name, description);
                const activityLevel = determineActivityLevel(memberCount);

                // Generate embedding
                const embeddingText = `${name} ${description} ${tags.join(' ')}`;
                const embedding = await generateEmbedding(embeddingText);

                const community: Community = {
                    id: `disboard_${Date.now()}_${i}`,
                    name,
                    platform: 'discord',
                    description: description.slice(0, 500),
                    category: categories.slice(0, 5),
                    tags,
                    memberCount,
                    activityLevel,
                    url,
                    imageUrl: server.find('.server-icon img').attr('src') || undefined,
                    embedding,
                    lastIndexed: new Date(),
                    metadata: {
                        verified: false,
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                communities.push(community);

                // Rate limiting
                await sleep(500);
            } catch (error) {
                console.error('Error parsing Disboard server:', error);
            }
        }
    } catch (error) {
        console.error('Error scraping Disboard:', error);
    }

    return communities;
}

/**
 * Scrape Top.gg (Discord bot and server directory)
 */
async function scrapeTopGG(limit: number): Promise<Community[]> {
    const communities: Community[] = [];

    try {
        const response = await axios.get('https://top.gg/servers', {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
        });

        const $ = cheerio.load(response.data);

        const servers = $('.server-card, .item-card').slice(0, limit);

        for (let i = 0; i < servers.length; i++) {
            try {
                const server = servers.eq(i);

                const name = server.find('.item-name, .server-name').text().trim();
                const description = server.find('.item-description, .server-description').text().trim();
                const memberCountText = server.find('.item-members, .server-members').text().trim();
                const memberCount = parseMemberCount(memberCountText);
                const url = 'https://top.gg' + server.find('a').attr('href');

                const tags = extractTags(name, description);
                const activityLevel = determineActivityLevel(memberCount);

                // Generate embedding
                const embeddingText = `${name} ${description} ${tags.join(' ')}`;
                const embedding = await generateEmbedding(embeddingText);

                const community: Community = {
                    id: `topgg_${Date.now()}_${i}`,
                    name,
                    platform: 'discord',
                    description: description.slice(0, 500),
                    category: ['gaming', 'community'],
                    tags,
                    memberCount,
                    activityLevel,
                    url,
                    imageUrl: server.find('.item-icon img, .server-icon img').attr('src') || undefined,
                    embedding,
                    lastIndexed: new Date(),
                    metadata: {
                        verified: false,
                    },
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };

                communities.push(community);

                // Rate limiting
                await sleep(500);
            } catch (error) {
                console.error('Error parsing Top.gg server:', error);
            }
        }
    } catch (error) {
        console.error('Error scraping Top.gg:', error);
    }

    return communities;
}

/**
 * Parse member count from text
 */
function parseMemberCount(text: string): number {
    const match = text.match(/(\d+(?:,\d+)*)/);
    if (match) {
        return parseInt(match[1].replace(/,/g, ''), 10);
    }
    return 0;
}

/**
 * Determine activity level
 */
function determineActivityLevel(memberCount: number): ActivityLevel {
    if (memberCount > 10000) return 'high';
    if (memberCount > 1000) return 'medium';
    return 'low';
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
        'art',
        'music',
        'anime',
        'community',
        'social',
        'learning',
        'support',
        'trading',
        'crypto',
        'nft',
        'meme',
        'roleplay',
        'minecraft',
        'fortnite',
        'valorant',
        'league',
    ];

    keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
            tags.add(keyword);
        }
    });

    return Array.from(tags).slice(0, 10);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
