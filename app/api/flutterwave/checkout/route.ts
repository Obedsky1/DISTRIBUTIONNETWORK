import { NextRequest, NextResponse } from 'next/server';
import { createFlutterwavePaymentLink, FlutterwavePlanId } from '@/lib/flutterwave/config';
import { getAuthUserId } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
    try {
        const { planId, userId, userEmail, userName } = await request.json();

        if (!planId || !userId || !userEmail) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const authUserId = await getAuthUserId(request);
        if (authUserId !== userId) {
            return NextResponse.json({ error: 'Unauthorized: Access Denied' }, { status: 401 });
        }

        if (planId === 'FREE') {
            return NextResponse.json(
                { error: 'Cannot create checkout for free plan' },
                { status: 400 }
            );
        }

        const origin = request.headers.get('origin') || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const checkoutUrl = await createFlutterwavePaymentLink(
            planId as FlutterwavePlanId,
            { id: userId, email: userEmail, name: userName },
            `${origin}/payment/success`
        );

        return NextResponse.json({ url: checkoutUrl });
    } catch (error) {
        console.error('Flutterwave Checkout error:', error);
        return NextResponse.json(
            { error: 'Failed to create checkout session' },
            { status: 500 }
        );
    }
}
