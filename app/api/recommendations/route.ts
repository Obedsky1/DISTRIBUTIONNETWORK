import { NextRequest, NextResponse } from 'next/server';
import { getRecommendations } from '@/lib/ai/recommendations';
import { getDocument } from '@/lib/firebase/firestore';
import { User } from '@/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Get user ID from query or auth header
        const userId = searchParams.get('userId');
        if (!userId) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User ID is required',
                },
                { status: 400 }
            );
        }

        // Fetch user data
        const user = await getDocument<User>('users', userId);
        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'User not found',
                },
                { status: 404 }
            );
        }

        // Parse parameters
        const limit = parseInt(searchParams.get('limit') || '20');
        const excludeIds = searchParams.get('exclude')?.split(',') || [];

        // Get recommendations
        const recommendations = await getRecommendations(user, limit, excludeIds);

        return NextResponse.json({
            success: true,
            data: {
                recommendations,
                count: recommendations.length,
            },
        });
    } catch (error: any) {
        console.error('Error getting recommendations:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to get recommendations',
            },
            { status: 500 }
        );
    }
}
