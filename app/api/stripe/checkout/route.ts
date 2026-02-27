import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
    try {
        const { planId, userId } = await request.json();

        if (!planId || !userId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (planId === 'FREE') {
            return NextResponse.json(
                { error: 'Cannot create checkout for free plan' },
                { status: 400 }
            );
        }

        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await createCheckoutSession(
            planId,
            userId,
            `${origin}/dashboard?success=true`,
            `${origin}/pricing?canceled=true`
        );

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
