import axios from 'axios';
import { Community, ActivityLevel } from '@/types';
import { generateEmbedding } from '@/lib/ai/gemini';

/**
 * Scrape public Telegram channels and groups
 */
export async function scrapeTelegramCommunities(limit = 100): Promise<Community[]> {
    try {
        const communities: Community[] = [];

        // Method 1: Scrape from Telegram directory websites
        const fromDirectories = await scrapeTelegramDirectories(limit);
        communities.push(...fromDirectories);

        // Method 2: If bot token is available, use Telegram API
        if (process.env.TELEGRAM_BOT_TOKEN) {
            const fromAPI = await scrapeTelegramViaAPI();
            communities.push(...fromAPI);
        }

        console.log(`Scraped ${communities.length} Telegram communities`);
        return communities;
    } catch (error) {
        console.error('Error scraping Telegram communities:', error);
        throw error;
    }
}

/**
 * Scrape Telegram communities from directory websites
 */
async function scrapeTelegramDirectories(limit: number): Promise<Community[]> {
    const communities: Community[] = [];

    try {
        // Use public Telegram directory APIs/websites
        // Example: tlgrm.eu, telegramchannels.me, etc.

        // For now, returning empty array - would implement actual scraping
        // This would involve parsing HTML from Telegram directory sites

        console.log('Telegram directory scraping not yet implemented');
        return communities;
    } catch (error) {
        console.error('Error scraping Telegram directories:', error);
        return communities;
    }
}

/**
 * Scrape Telegram communities via Bot API
 */
async function scrapeTelegramViaAPI(): Promise<Community[]> {
    const communities: Community[] = [];

    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) return communities;

        // Use Telegram Bot API to get channel info
        // Note: Bot needs to be added to channels to get their info

        // This is a placeholder - actual implementation would require
        // maintaining a list of known public channels

        console.log('Telegram API scraping requires channel list');
        return communities;
    } catch (error) {
        console.error('Error scraping via Telegram API:', error);
        return communities;
    }
}

/**
 * Get Telegram channel details
 */
export async function getTelegramChannelDetails(username: string): Promise<Community | null> {
    try {
        const botToken = process.env.TELEGRAM_BOT_TOKEN;
        if (!botToken) {
            throw new Error('TELEGRAM_BOT_TOKEN not set');
        }

        // Get chat info using Bot API
        const response = await axios.get(
            `https://api.telegram.org/bot${botToken}/getChat`,
            {
                params: { chat_id: `@${username}` },
            }
        );

        if (!response.data.ok) {
            return null;
        }

        const chat = response.data.result;

        // Get member count
        const memberResponse = await axios.get(
            `https://api.telegram.org/bot${botToken}/getChatMemberCount`,
            {
                params: { chat_id: `@${username}` },
            }
        );

        const memberCount = memberResponse.data.ok ? memberResponse.data.result : 0;

        const description = chat.description || `Telegram ${chat.type}: ${chat.title}`;
        const activityLevel = determineActivityLevel(memberCount);

        // Extract tags
        const tags = extractTags(chat.title, description);

        // Generate embedding
        const embeddingText = `${chat.title} ${description} ${tags.join(' ')}`;
        const embedding = await generateEmbedding(embeddingText);

        const community: Community = {
            id: `telegram_${chat.id}`,
            name: chat.title,
            platform: 'telegram',
            description: description.slice(0, 500),
            category: [chat.type === 'channel' ? 'channel' : 'group'],
            tags,
            memberCount,
            activityLevel,
            url: chat.invite_link || `https://t.me/${username}`,
            imageUrl: chat.photo?.big_file_id || undefined,
            embedding,
            lastIndexed: new Date(),
            metadata: {
                telegramUsername: username,
                verified: chat.is_verified || false,
            },
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        return community;
    } catch (error) {
        console.error(`Error getting Telegram channel details for ${username}:`, error);
        return null;
    }
}

/**
 * Determine activity level based on member count
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
        'news',
        'tech',
        'crypto',
        'trading',
        'finance',
        'gaming',
        'entertainment',
        'education',
        'business',
        'marketing',
        'social',
        'community',
        'support',
        'deals',
        'offers',
    ];

    keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
            tags.add(keyword);
        }
    });

    return Array.from(tags).slice(0, 10);
}
