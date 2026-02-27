import { NextRequest, NextResponse } from 'next/server';
import { generateContent, ContentType } from '@/lib/ai/content-generator';
import { z } from 'zod';

const contentGenerationSchema = z.object({
    type: z.enum(['comment', 'story', 'post', 'description']),
    context: z.object({
        productName: z.string().optional(),
        brandVoice: z.enum(['professional', 'casual', 'friendly', 'technical']).optional(),
        targetAudience: z.string().optional(),
        topic: z.string().optional(),
        platform: z.string().optional(),
        additionalContext: z.string().optional(),
    }),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = contentGenerationSchema.parse(body);

        // TODO: Check user subscription and usage limits
        // For now, we'll allow all requests

        // Generate content
        const result = await generateContent({
            type: validatedData.type as ContentType,
            context: validatedData.context,
        });

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

        console.error('Content generation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate content',
            },
            { status: 500 }
        );
    }
}
