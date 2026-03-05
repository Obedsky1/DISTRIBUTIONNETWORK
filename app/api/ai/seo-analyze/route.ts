import { NextRequest, NextResponse } from 'next/server';
import { analyzeSEO, generateKeywords, generateMetaTags } from '@/lib/ai/seo-analyzer';
import { getAuthUserId } from '@/lib/api-auth';
import { z } from 'zod';

const seoAnalysisSchema = z.object({
    action: z.enum(['analyze', 'keywords', 'metatags']),
    url: z.string().url().optional(),
    content: z.string().optional(),
    targetKeyword: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    topic: z.string().optional(),
    keywordCount: z.number().optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = seoAnalysisSchema.parse(body);

        const authUserId = await getAuthUserId(request);
        if (!authUserId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // TODO: Check user subscription and usage limits

        let result;

        switch (validatedData.action) {
            case 'analyze':
                result = await analyzeSEO({
                    url: validatedData.url,
                    content: validatedData.content,
                    targetKeyword: validatedData.targetKeyword,
                    title: validatedData.title,
                    description: validatedData.description,
                });
                break;

            case 'keywords':
                if (!validatedData.topic) {
                    return NextResponse.json(
                        { success: false, error: 'Topic is required for keyword generation' },
                        { status: 400 }
                    );
                }
                result = await generateKeywords(validatedData.topic, validatedData.keywordCount);
                break;

            case 'metatags':
                if (!validatedData.topic) {
                    return NextResponse.json(
                        { success: false, error: 'Topic is required for meta tag generation' },
                        { status: 400 }
                    );
                }
                result = await generateMetaTags({
                    topic: validatedData.topic,
                    description: validatedData.description,
                });
                break;

            default:
                return NextResponse.json(
                    { success: false, error: 'Invalid action' },
                    { status: 400 }
                );
        }

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Validation error',
                    details: error.errors,
                },
                { status: 400 }
            );
        }

        console.error('SEO analysis error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to perform SEO analysis',
            },
            { status: 500 }
        );
    }
}
