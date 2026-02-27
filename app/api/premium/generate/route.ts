import { NextRequest, NextResponse } from 'next/server';
import { generateContent, checkGenerationLimit } from '@/lib/ai/contentGenerator';
import { getDocument, updateDocument } from '@/lib/firebase/firestore';
import { User, ContentType } from '@/types';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId, type, prompt, platform, context, tone, length } = body;

        // Validate required fields
        if (!userId || !type || !prompt) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'userId, type, and prompt are required',
                },
                { status: 400 }
            );
        }

        // Fetch user
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

        // Check if user is premium
        if (!user.isPremium) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Premium subscription required',
                    message: 'This feature is only available to premium users',
                },
                { status: 403 }
            );
        }

        // Check generation limits
        const limitCheck = await checkGenerationLimit(userId, user.isPremium);
        if (!limitCheck.allowed) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Generation limit reached',
                    message: 'You have reached your monthly generation limit',
                },
                { status: 429 }
            );
        }

        // Generate content
        const generatedText = await generateContent({
            type: type as ContentType,
            prompt,
            platform,
            context,
            tone,
            length,
        });

        // Update user stats
        await updateDocument('users', userId, {
            'stats.contentGenerated': (user.stats.contentGenerated || 0) + 1,
        });

        // Save generated content to database
        const contentId = `${userId}_${Date.now()}`;
        await updateDocument('generatedContent', contentId, {
            userId,
            type,
            prompt,
            generatedText,
            platform,
            createdAt: new Date(),
        });

        return NextResponse.json({
            success: true,
            data: {
                generatedText,
                type,
                remaining: limitCheck.remaining - 1,
            },
        });
    } catch (error: any) {
        console.error('Error generating content:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Content generation failed',
            },
            { status: 500 }
        );
    }
}
