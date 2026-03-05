import { NextRequest, NextResponse } from 'next/server';
import { analyzeBrand } from '@/lib/ai/brand-analyzer';
import { getAuthUserId } from '@/lib/api-auth';
import { z } from 'zod';

const brandAnalysisSchema = z.object({
    brandName: z.string().min(1, 'Brand name is required'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    targetAudience: z.string().optional(),
    industry: z.string().optional(),
    goals: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validate input
        const validatedData = brandAnalysisSchema.parse(body);

        const authUserId = await getAuthUserId(request);
        if (!authUserId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // TODO: Check user subscription and usage limits
        // For now, we'll allow all requests

        // Perform brand analysis
        const analysis = await analyzeBrand(validatedData);

        return NextResponse.json({
            success: true,
            data: analysis,
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

        console.error('Brand analysis error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to analyze brand',
            },
            { status: 500 }
        );
    }
}
