import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding, cosineSimilarity } from '@/lib/ai/gemini';
import { queryDocuments } from '@/lib/firebase/firestore';
import { Community } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { query, platforms, categories, limit = 20 } = body;

        if (!query || typeof query !== 'string') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Search query is required',
                },
                { status: 400 }
            );
        }

        // Generate embedding for search query
        const queryEmbedding = await generateEmbedding(query);

        // Fetch communities with optional filters
        const filters: any[] = [];

        if (platforms && platforms.length > 0) {
            filters.push({ field: 'platform', operator: 'in', value: platforms });
        }

        let communities = await queryDocuments<Community>('communities', filters);

        // Filter by categories if provided
        if (categories && categories.length > 0) {
            communities = communities.filter((c) =>
                c.category.some((cat) => categories.includes(cat))
            );
        }

        // Calculate similarity scores
        const scoredCommunities = communities
            .filter((c) => c.embedding && c.embedding.length > 0)
            .map((community) => ({
                community,
                score: cosineSimilarity(queryEmbedding, community.embedding),
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return NextResponse.json({
            success: true,
            data: {
                results: scoredCommunities,
                query,
                count: scoredCommunities.length,
            },
        });
    } catch (error: any) {
        console.error('Error performing search:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Search failed',
            },
            { status: 500 }
        );
    }
}
