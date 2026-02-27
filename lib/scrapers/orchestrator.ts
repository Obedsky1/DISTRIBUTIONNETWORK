import { Community } from '@/types';
import { scrapeDiscordServers } from './discord';
import { scrapeRedditCommunities } from './reddit';
import { scrapeTelegramCommunities } from './telegram';
import { scrapeDirectories } from './directory';
import { batchSetDocuments } from '@/lib/firebase/firestore';

export interface ScraperConfig {
    enableDiscord: boolean;
    enableReddit: boolean;
    enableTelegram: boolean;
    enableDirectories: boolean;
    maxCommunitiesPerPlatform: number;
}

export interface ScraperResult {
    success: boolean;
    totalScraped: number;
    byPlatform: {
        discord: number;
        reddit: number;
        telegram: number;
        directory: number;
    };
    errors: string[];
    duration: number;
}

/**
 * Orchestrate all scraping operations
 */
export async function runAllScrapers(config?: Partial<ScraperConfig>): Promise<ScraperResult> {
    const startTime = Date.now();

    const defaultConfig: ScraperConfig = {
        enableDiscord: true,
        enableReddit: true,
        enableTelegram: true,
        enableDirectories: true,
        maxCommunitiesPerPlatform: 100,
    };

    const finalConfig = { ...defaultConfig, ...config };

    const result: ScraperResult = {
        success: true,
        totalScraped: 0,
        byPlatform: {
            discord: 0,
            reddit: 0,
            telegram: 0,
            directory: 0,
        },
        errors: [],
        duration: 0,
    };

    const allCommunities: Community[] = [];

    try {
        console.log('Starting community scraping...');

        // Run scrapers in parallel
        const scraperPromises: Promise<Community[]>[] = [];

        if (finalConfig.enableDiscord) {
            console.log('Scraping Discord servers...');
            scraperPromises.push(
                scrapeDiscordServers()
                    .then((communities) => {
                        result.byPlatform.discord = communities.length;
                        console.log(`✓ Scraped ${communities.length} Discord servers`);
                        return communities;
                    })
                    .catch((error) => {
                        result.errors.push(`Discord: ${error.message}`);
                        console.error('✗ Discord scraping failed:', error);
                        return [];
                    })
            );
        }

        if (finalConfig.enableReddit) {
            console.log('Scraping Reddit communities...');
            scraperPromises.push(
                scrapeRedditCommunities(finalConfig.maxCommunitiesPerPlatform)
                    .then((communities) => {
                        result.byPlatform.reddit = communities.length;
                        console.log(`✓ Scraped ${communities.length} Reddit communities`);
                        return communities;
                    })
                    .catch((error) => {
                        result.errors.push(`Reddit: ${error.message}`);
                        console.error('✗ Reddit scraping failed:', error);
                        return [];
                    })
            );
        }

        if (finalConfig.enableTelegram) {
            console.log('Scraping Telegram communities...');
            scraperPromises.push(
                scrapeTelegramCommunities(finalConfig.maxCommunitiesPerPlatform)
                    .then((communities) => {
                        result.byPlatform.telegram = communities.length;
                        console.log(`✓ Scraped ${communities.length} Telegram communities`);
                        return communities;
                    })
                    .catch((error) => {
                        result.errors.push(`Telegram: ${error.message}`);
                        console.error('✗ Telegram scraping failed:', error);
                        return [];
                    })
            );
        }

        if (finalConfig.enableDirectories) {
            console.log('Scraping community directories...');
            scraperPromises.push(
                scrapeDirectories(finalConfig.maxCommunitiesPerPlatform)
                    .then((communities) => {
                        result.byPlatform.directory = communities.length;
                        console.log(`✓ Scraped ${communities.length} communities from directories`);
                        return communities;
                    })
                    .catch((error) => {
                        result.errors.push(`Directories: ${error.message}`);
                        console.error('✗ Directory scraping failed:', error);
                        return [];
                    })
            );
        }

        // Wait for all scrapers to complete
        const scraperResults = await Promise.all(scraperPromises);

        // Flatten results
        scraperResults.forEach((communities) => {
            allCommunities.push(...communities);
        });

        result.totalScraped = allCommunities.length;

        // Save to Firestore
        if (allCommunities.length > 0) {
            console.log(`Saving ${allCommunities.length} communities to database...`);
            await saveCommunities(allCommunities);
            console.log('✓ Communities saved successfully');
        }

        result.duration = Date.now() - startTime;
        result.success = result.errors.length === 0;

        console.log(`\nScraping completed in ${(result.duration / 1000).toFixed(2)}s`);
        console.log(`Total communities scraped: ${result.totalScraped}`);
        console.log(`Errors: ${result.errors.length}`);

        return result;
    } catch (error: any) {
        result.success = false;
        result.errors.push(`Orchestrator: ${error.message}`);
        result.duration = Date.now() - startTime;
        console.error('Scraping orchestration failed:', error);
        return result;
    }
}

/**
 * Save communities to Firestore
 */
async function saveCommunities(communities: Community[]): Promise<void> {
    try {
        // Prepare documents for batch insert
        const documents = communities.map((community) => ({
            id: community.id,
            data: community,
        }));

        // Save in batches of 100 (Firestore limit is 500)
        const batchSize = 100;
        for (let i = 0; i < documents.length; i += batchSize) {
            const batch = documents.slice(i, i + batchSize);
            await batchSetDocuments('communities', batch);
            console.log(`Saved batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(documents.length / batchSize)}`);
        }
    } catch (error) {
        console.error('Error saving communities:', error);
        throw error;
    }
}

/**
 * Run a single platform scraper
 */
export async function runSingleScraper(
    platform: 'discord' | 'reddit' | 'telegram' | 'directory',
    limit = 100
): Promise<Community[]> {
    try {
        let communities: Community[] = [];

        switch (platform) {
            case 'discord':
                communities = await scrapeDiscordServers();
                break;
            case 'reddit':
                communities = await scrapeRedditCommunities(limit);
                break;
            case 'telegram':
                communities = await scrapeTelegramCommunities(limit);
                break;
            case 'directory':
                communities = await scrapeDirectories(limit);
                break;
            default:
                throw new Error(`Unknown platform: ${platform}`);
        }

        // Save to Firestore
        if (communities.length > 0) {
            await saveCommunities(communities);
        }

        return communities;
    } catch (error) {
        console.error(`Error running ${platform} scraper:`, error);
        throw error;
    }
}
