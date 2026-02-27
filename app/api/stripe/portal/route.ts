import { NextRequest, NextResponse } from 'next/server';
import { createPortalSession } from '@/lib/stripe/config';

export async function POST(request: NextRequest) {
    try {
        const { customerId } = await request.json();

        if (!customerId) {
            return NextResponse.json(
                { error: 'Customer ID is required' },
                { status: 400 }
            );
        }

        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const session = await createPortalSession(
            customerId,
            `${origin}/dashboard`
        );

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Portal error:', error);
        return NextResponse.json(
            { error: 'Failed to create portal session' },
            { status: 500 }
        );
    }
}
