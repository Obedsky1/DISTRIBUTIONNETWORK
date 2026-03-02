import { XpozClient } from "@xpoz/xpoz";

export interface SocialPost {
    id: string;
    platform: 'reddit' | 'twitter' | 'linkedin' | 'instagram';
    author: string;
    content: string;
    url: string;
    createdAt: string;
    engagement?: {
        likes?: number | null;
        replies?: number | null;
        retweets?: number | null;
        score?: number | null;
        comments?: number | null;
    };
    subreddit?: string | null;
    lang?: string | null;
    relevanceScore?: number;
}

/**
 * Score how relevant a post is to the search query.
 * Returns 0-100 where higher = more relevant.
 */
function scoreRelevance(text: string, query: string): number {
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();

    // Exact full phrase match → highest score
    if (lowerText.includes(lowerQuery)) return 100;

    // Break query into meaningful words (skip stop words)
    const stopWords = new Set(['a', 'an', 'the', 'for', 'and', 'or', 'is', 'in', 'to', 'of', 'i', 'my', 'me', 'do', 'does', 'any', 'anyone', 'know', 'how', 'what', 'with', 'can', 'you', 'your']);
    const queryWords = lowerQuery.split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

    if (queryWords.length === 0) return 0;

    // Count how many meaningful query words appear in the text
    const matchedWords = queryWords.filter(w => lowerText.includes(w));
    const wordMatchRatio = matchedWords.length / queryWords.length;

    // Bonus: consecutive word pairs from query found in text
    let pairBonus = 0;
    for (let i = 0; i < queryWords.length - 1; i++) {
        const pair = queryWords[i] + ' ' + queryWords[i + 1];
        if (lowerText.includes(pair)) pairBonus += 15;
    }

    return Math.min(100, Math.round(wordMatchRatio * 60) + pairBonus);
}

export async function fetchSocialListeningData(keyword: string): Promise<SocialPost[]> {
    const apiKey = process.env.XPOZ_API_KEY;

    if (!apiKey) {
        throw new Error("XPOZ_API_KEY is not defined in environment variables.");
    }

    const client = new XpozClient({ apiKey, timeoutMs: 45000 });
    await client.connect();

    try {
        // Only use the first single word from the keyword for the API search
        const query = keyword.trim().split(/\s+/)[0] || keyword.trim();
        console.log(`[XPOZ] Searching for single word: "${query}" (English only, with relevance filtering)`);

        const [twitterResults, redditResults] = await Promise.all([
            client.twitter.searchPosts(query, {
                language: 'en',
                fields: ['id', 'text', 'authorUsername', 'createdAtDate', 'lang',
                    'likeCount', 'retweetCount', 'replyCount'],
            }).catch((e: any) => { console.error('[XPOZ] Twitter Error:', e.message || e); return { data: [] }; }),

            client.reddit.searchPosts(query, {
                sort: 'relevance',
                time: 'year',
                fields: ['id', 'title', 'selftext', 'url', 'permalink', 'authorUsername',
                    'createdAtDate', 'subredditName', 'score', 'commentsCount'],
            }).catch((e: any) => { console.error('[XPOZ] Reddit Error:', e.message || e); return { data: [] }; })
        ]);

        const posts: SocialPost[] = [];

        // ── Twitter: score & filter ──
        const twData = (twitterResults?.data || [])
            .filter(t => !t.text?.startsWith('RT @')) // Skip retweets
            .map(t => ({
                ...t,
                _score: scoreRelevance(t.text || '', query),
            }))
            .filter(t => t._score >= 30) // Only posts matching at least ~50% of keywords
            .sort((a, b) => b._score - a._score)
            .slice(0, 8);

        for (const t of twData) {
            posts.push({
                id: 'twitter_' + t.id,
                platform: 'twitter',
                author: '@' + (t.authorUsername || 'unknown'),
                content: t.text || '',
                url: `https://twitter.com/${t.authorUsername}/status/${t.id}`,
                createdAt: t.createdAtDate || new Date().toISOString(),
                lang: t.lang,
                relevanceScore: t._score,
                engagement: {
                    likes: t.likeCount,
                    retweets: t.retweetCount,
                    replies: t.replyCount,
                },
            });
        }

        // ── Reddit: score & filter ──
        const rdData = (redditResults?.data || [])
            .map(r => {
                const fullText = [r.title, r.selftext].filter(Boolean).join(' ');
                return { ...r, _fullText: fullText, _score: scoreRelevance(fullText, query) };
            })
            .filter(r => r._score >= 30)
            .sort((a, b) => b._score - a._score || (b.score ?? 0) - (a.score ?? 0))
            .slice(0, 8);

        for (const r of rdData) {
            const content = r._fullText.slice(0, 500);
            posts.push({
                id: 'reddit_' + r.id,
                platform: 'reddit',
                author: 'u/' + (r.authorUsername || 'unknown'),
                content,
                url: r.permalink ? `https://reddit.com${r.permalink}` : (r.url || ''),
                createdAt: r.createdAtDate || new Date().toISOString(),
                subreddit: r.subredditName,
                relevanceScore: r._score,
                engagement: {
                    score: r.score,
                    comments: r.commentsCount,
                },
            });
        }

        // Sort final mixed results by relevance score
        posts.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

        console.log(`[XPOZ] Raw: ${twitterResults?.data?.length || 0} tweets, ${redditResults?.data?.length || 0} reddit posts`);
        console.log(`[XPOZ] After relevance filtering: ${posts.length} relevant posts (min score 30)`);

        return posts;
    } catch (error) {
        console.error("[XPOZ] Error fetching live data:", error);
        throw error;
    } finally {
        await client.close();
    }
}
