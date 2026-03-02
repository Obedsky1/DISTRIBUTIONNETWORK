import { v4 as uuidv4 } from 'uuid';

export const FLUTTERWAVE_PRICING_PLANS = {
    PRO: {
        id: 'PRO',
        name: 'Pro Launch',
        price: 9.99,
        // Set this in your environment variables if you have a flutterwave subscription plan
        planId: process.env.FLUTTERWAVE_PRO_PLAN_ID,
    },
    DONE_FOR_YOU: {
        id: 'DONE_FOR_YOU',
        name: 'Done For You',
        price: 99,
        planId: process.env.FLUTTERWAVE_DFY_PLAN_ID,
    }
} as const;

export type FlutterwavePlanId = keyof typeof FLUTTERWAVE_PRICING_PLANS;

export async function createFlutterwavePaymentLink(
    planId: FlutterwavePlanId,
    user: { id: string; email: string; name?: string },
    redirectUrl: string
) {
    const plan = FLUTTERWAVE_PRICING_PLANS[planId];
    if (!plan) throw new Error("Invalid plan");

    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) throw new Error("Flutterwave secret key not configured");

    const uniqueId = uuidv4().replace(/-/g, '').substring(0, 10);
    const payload: any = {
        tx_ref: `tx_${user.id.substring(0, 10)}_${Date.now()}_${uniqueId}`,
        amount: plan.price.toString(),
        currency: "USD",
        redirect_url: redirectUrl,
        customer: {
            email: user.email,
            name: user.name || "User",
        },
        meta: {
            userId: user.id,
            planId: plan.id,
        },
        customizations: {
            title: plan.name,
            description: `Payment for ${plan.name} plan`,
        }
    };

    if (plan.planId) {
        payload.payment_plan = plan.planId;
    }

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("Flutterwave API Error:", err);
        throw new Error("Failed to create Flutterwave payment link");
    }

    const data = await response.json();
    if (data.status === "success" && data.data && data.data.link) {
        return data.data.link;
    } else {
        throw new Error(data.message || "Failed to get payment link from Flutterwave");
    }
}

export async function verifyFlutterwaveTransaction(transactionId: string) {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) throw new Error("Flutterwave secret key not configured");

    const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transactionId}/verify`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json"
        }
    });

    if (!response.ok) {
        const err = await response.text();
        console.error("Flutterwave API Verification Error:", err);
        throw new Error("Failed to verify transaction with Flutterwave");
    }

    const data = await response.json();
    if (data.status === "success" && data.data && data.data.status === "successful") {
        return data.data; // Includes meta, user details, etc.
    } else {
        throw new Error(data.message || "Payment was not successful");
    }
}
