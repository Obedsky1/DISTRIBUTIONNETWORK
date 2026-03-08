import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
    const signature = req.headers.get('verif-hash');
    const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH;

    // Security Check: Verify signature if secret hash is configured
    if (secretHash && signature !== secretHash) {
        console.error('[Webhook] Invalid signature');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { event, data } = body;

        // Only process successful payments
        if (event !== 'charge.completed' || data.status !== 'successful') {
            return NextResponse.json({ received: true });
        }

        const transactionId = data.id.toString();
        const userId = data.meta?.userId;
        const planId = data.meta?.planId || 'PRO';

        if (!userId) {
            console.error('[Webhook] No userId in metadata');
            return NextResponse.json({ error: 'No userId' }, { status: 400 });
        }

        if (!adminDb) {
            return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
        }

        // 1. Check if already processed
        const existingSub = await adminDb.collection('subscriptions')
            .where('transactionId', '==', transactionId)
            .limit(1)
            .get();

        if (!existingSub.empty) {
            return NextResponse.json({ received: true, note: 'already processed' });
        }

        // 2. Update user and log subscription (Duplicate of verify route for reliability)
        const userRef = adminDb.collection('users').doc(userId);
        const premiumUntil = new Date();
        premiumUntil.setDate(premiumUntil.getDate() + 30);

        const batch = adminDb.batch();
        batch.update(userRef, {
            isPremium: true,
            subscriptionPlan: planId,
            premiumSince: new Date(),
            premiumUntil: premiumUntil,
            updatedAt: new Date(),
            lastPaymentTransactionId: transactionId
        });

        const subscriptionRef = adminDb.collection('subscriptions').doc();
        batch.set(subscriptionRef, {
            userId,
            plan: planId,
            status: 'active',
            startDate: new Date(),
            endDate: premiumUntil,
            paymentMethod: 'flutterwave_webhook',
            transactionId: transactionId,
            amount: data.amount,
            currency: data.currency,
        });

        await batch.commit();
        console.log(`[Webhook] Successfully processed payment for user ${userId}`);

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error('[Webhook] Error processing webhook:', error.message);
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}
