import { Client, GatewayIntentBits } from 'discord.js';
import { Community, ActivityLevel } from '@/types';
import { generateEmbedding } from '@/lib/ai/gemini';

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

let isClientReady = false;

/**
 * Initialize Discord bot
 */
export async function initializeDiscordBot(): Promise<void> {
    if (isClientReady) return;

    const token = process.env.DISCORD_BOT_TOKEN;
    if (!token) {
        throw new Error('DISCORD_BOT_TOKEN is not set');
    }

    return new Promise((resolve, reject) => {
        client.once('ready', () => {
            console.log(`Discord bot logged in as ${client.user?.tag}`);
            isClientReady = true;
            resolve();
        });

        client.on('error', (error) => {
            console.error('Discord client error:', error);
            reject(error);
        });

        client.login(token).catch(reject);
    });
}

/**
 * Scrape Discord servers
 */
export async function scrapeDiscordServers(): Promise<Community[]> {
    try {
        if (!isClientReady) {
            await initializeDiscordBot();
        }

        const communities: Community[] = [];
        const guilds = client.guilds.cache;

        for (const [, guild] of guilds) {
            try {
                // Fetch full guild data
                await guild.fetch();

                // Determine activity level based on member count and online members
                const activityLevel = determineActivityLevel(
                    guild.memberCount,
                    guild.approximatePresenceCount || 0
                );

                // Create description from guild info
                const description = guild.description || `Discord server: ${guild.name}`;

                // Extract categories from channel names
                const categories = extractCategories(guild);

                // Generate embedding
                const embeddingText = `${guild.name} ${description} ${categories.join(' ')}`;
                const embedding = await generateEmbedding(embeddingText);

                const community: Community = {
                    id: guild.id,
                    name: guild.name,
                    platform: 'discord',
                    description,
                    category: categories,
                    tags: extractTags(guild.name, description),
                    memberCount: guild.memberCount,
                    activityLevel,
                    url: guild.vanityURLCode
                        ? `https://discord.gg/${guild.vanityURLCode}`
                        : `https://discord.com/channels/${guild.id}`,
                    imageUrl: guild.iconURL({ size: 512 }) || undefined,
                    embedding,
                    lastIndexed: new Date(),
                    metadata: {
                        inviteCode: guild.vanityURLCode || undefined,
                        verified: guild.verified,
                    },
                    createdAt: guild.createdAt,
                    updatedAt: new Date(),
                };

                communities.push(community);
            } catch (error) {
                console.error(`Error scraping Discord server ${guild.name}:`, error);
            }
        }

        console.log(`Scraped ${communities.length} Discord servers`);
        return communities;
    } catch (error) {
        console.error('Error scraping Discord servers:', error);
        throw error;
    }
}

/**
 * Determine activity level based on member count and online members
 */
function determineActivityLevel(memberCount: number, onlineCount: number): ActivityLevel {
    const onlineRatio = onlineCount / memberCount;

    if (memberCount > 10000 && onlineRatio > 0.1) return 'high';
    if (memberCount > 1000 && onlineRatio > 0.05) return 'high';
    if (memberCount > 500 || onlineRatio > 0.03) return 'medium';
    return 'low';
}

/**
 * Extract categories from guild channels
 */
function extractCategories(guild: any): string[] {
    const categories = new Set<string>();

    // Add categories from channel names
    guild.channels.cache.forEach((channel: any) => {
        if (channel.type === 4) {
            // Category channel
            categories.add(channel.name.toLowerCase());
        }
    });

    // Default category if none found
    if (categories.size === 0) {
        categories.add('general');
    }

    return Array.from(categories).slice(0, 5);
}

/**
 * Extract tags from name and description
 */
function extractTags(name: string, description: string): string[] {
    const text = `${name} ${description}`.toLowerCase();
    const tags = new Set<string>();

    // Common keywords
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
    ];

    keywords.forEach((keyword) => {
        if (text.includes(keyword)) {
            tags.add(keyword);
        }
    });

    return Array.from(tags).slice(0, 10);
}

/**
 * Cleanup Discord bot connection
 */
export async function cleanupDiscordBot(): Promise<void> {
    if (isClientReady) {
        await client.destroy();
        isClientReady = false;
    }
}
