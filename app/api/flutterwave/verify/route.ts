import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

async function verifyWithFlutterwave(transactionId: string) {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) throw new Error("Flutterwave secret key not configured");

    const res = await fetch(
        `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${secretKey}`,
                "Content-Type": "application/json"
            },
            cache: 'no-store'
        }
    );

    const bodyText = await res.text();
    let data: any;

    try {
        data = JSON.parse(bodyText);
    } catch {
        throw new Error(`Flutterwave returned non-JSON response: ${bodyText.substring(0, 100)}`);
    }

    console.log('[Flutterwave Verify]', JSON.stringify(data, null, 2));

    if (data.status !== "success" || !data.data) {
        throw new Error(data.message || "Transaction not found or verification failed");
    }

    if (data.data.status !== "successful") {
        throw new Error(`Payment status is '${data.data.status}', not 'successful'`);
    }

    return data.data;
}

export async function POST(request: NextRequest) {
    let body: any;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const { transaction_id } = body;

    if (!transaction_id) {
        return NextResponse.json({ error: 'Missing transaction_id' }, { status: 400 });
    }

    // 1. Verify payment with Flutterwave
    let transactionData: any;
    try {
        transactionData = await verifyWithFlutterwave(transaction_id);
    } catch (err: any) {
        console.error('[Verify] Flutterwave verification error:', err.message);
        return NextResponse.json({ error: err.message || 'Flutterwave verification failed' }, { status: 400 });
    }

    // 2. Extract metadata
    const userId: string | undefined = transactionData?.meta?.userId;
    const planId: string = transactionData?.meta?.planId || 'PRO';

    if (!userId) {
        console.error('[Verify] No userId found in Flutterwave transaction metadata', transactionData?.meta);
        return NextResponse.json({ error: 'No userId found in transaction metadata' }, { status: 400 });
    }

    // 3. Update user in Firestore
    if (!adminDb) {
        console.error('[Verify] Firebase Admin SDK not initialized');
        return NextResponse.json({ error: 'Internal server error: Database not configured' }, { status: 500 });
    }

    try {
        const userRef = adminDb.collection('users').doc(userId);
        const premiumUntil = new Date();
        premiumUntil.setDate(premiumUntil.getDate() + 30);

        await userRef.update({
            isPremium: true,
            subscriptionPlan: planId,
            premiumSince: new Date(),
            premiumUntil: premiumUntil,
            updatedAt: new Date(),
            lastPaymentTransactionId: transaction_id
        });

        // Also log the subscription
        const subscriptionRef = adminDb.collection('subscriptions').doc();
        await subscriptionRef.set({
            userId,
            plan: planId,
            status: 'active',
            startDate: new Date(),
            endDate: premiumUntil,
            paymentMethod: 'flutterwave',
            transactionId: transaction_id,
            amount: transactionData.amount,
            currency: transactionData.currency,
        });

        console.log(`[Verify] Successfully upgraded user ${userId} to ${planId}`);
        return NextResponse.json({ success: true, planId, userId });
    } catch (err: any) {
        console.error('[Verify] Firestore update error:', err.message);
        return NextResponse.json({ error: 'Failed to update user in database: ' + err.message }, { status: 500 });
    }
}
