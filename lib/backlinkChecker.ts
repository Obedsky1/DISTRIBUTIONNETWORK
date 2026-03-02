import axios from 'axios';
import * as cheerio from 'cheerio';

export interface BacklinkResult {
    found: boolean;
    anchor: string | null;
    rel: string | null;
    status: number;
}

/**
 * Validates if the given URL is safe and valid (http/https, and not a private IP).
 */
function isSafeUrl(urlString: string): boolean {
    try {
        const url = new URL(urlString);

        // Must be http or https
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            return false;
        }

        const hostname = url.hostname;

        // Block localhost and common internal domains
        if (hostname === 'localhost' || hostname.endsWith('.local')) {
            return false;
        }

        // Basic IPv4 extraction for private range check
        const ipMatch = hostname.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
        if (ipMatch) {
            const octet1 = parseInt(ipMatch[1], 10);
            const octet2 = parseInt(ipMatch[2], 10);

            // 127.0.0.0/8
            if (octet1 === 127) return false;
            // 10.0.0.0/8
            if (octet1 === 10) return false;
            // 192.168.0.0/16
            if (octet1 === 192 && octet2 === 168) return false;
            // 172.16.0.0/12
            if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false;
            // 169.254.0.0/16
            if (octet1 === 169 && octet2 === 254) return false;
        }

        return true;
    } catch {
        // Unparseable URL
        return false;
    }
}

/**
 * Checks a live URL to see if it links back to the targetDomain.
 * 
 * @param liveUrl The URL of the page where the backlink should be located.
 * @param targetDomain The domain that should be linked to (e.g., "example.com").
 * @returns A promise resolving to a BacklinkResult object.
 */
export async function checkBacklink(liveUrl: string, targetDomain: string): Promise<BacklinkResult> {
    if (!isSafeUrl(liveUrl)) {
        return {
            found: false,
            anchor: null,
            rel: null,
            status: 400 // Bad Request for invalid/unsafe URL
        };
    }

    try {
        const response = await axios.get(liveUrl, {
            timeout: 10000, // 10 second timeout
            maxContentLength: 5 * 1024 * 1024, // Limit max HTML response size to 5MB
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; DistroHubBot/1.0; +http://distrohub.com)'
            }
        });

        const status = response.status;
        const html = response.data;

        if (typeof html !== 'string') {
            return {
                found: false,
                anchor: null,
                rel: null,
                status
            };
        }

        const $ = cheerio.load(html);
        let linkFound = false;
        let anchorText: string | null = null;
        let relType: string | null = null;

        $('a').each((_, element) => {
            if (linkFound) return; // Stop if we already found the first match

            const href = $(element).attr('href');
            if (href && href.includes(targetDomain)) {
                linkFound = true;
                anchorText = $(element).text().trim().substring(0, 500) || null; // limit anchor text size

                const relAttr = $(element).attr('rel') || '';
                const relLower = relAttr.toLowerCase();

                if (relLower.includes('nofollow')) {
                    relType = 'nofollow';
                } else if (relLower.includes('ugc')) {
                    relType = 'ugc';
                } else if (relLower.includes('sponsored')) {
                    relType = 'sponsored';
                } else {
                    relType = 'dofollow';
                }
            }
        });

        return {
            found: linkFound,
            anchor: anchorText,
            rel: relType,
            status
        };

    } catch (error: any) {
        // Log error but don't crash
        console.error(`Error checking backlink for ${liveUrl}:`, error.message);

        let status = 0;
        if (error.response) {
            status = error.response.status;
        }

        return {
            found: false,
            anchor: null,
            rel: null,
            status
        };
    }
}
