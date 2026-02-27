import Stripe from 'stripe';

// Lazy-load Stripe instance only on server-side
let stripeInstance: Stripe | null = null;

function getStripe(): Stripe {
    if (!stripeInstance) {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
        }
        stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-02-24.acacia',
        });
    }
    return stripeInstance;
}


export const PRICING_PLANS = {
    FREE: {
        id: 'free',
        name: 'Free',
        price: 0,
        interval: 'month' as const,
        features: [
            'Basic brand analysis (1 per day)',
            'Limited community search',
            'Basic SEO tools',
            'Access to 500+ directories',
            'Community recommendations',
        ],
        limits: {
            brandAnalysisPerDay: 1,
            contentGenerationPerMonth: 0,
            seoAnalysisPerMonth: 5,
        },
    },
    PRO: {
        id: 'pro',
        name: 'Pro',
        price: 29,
        priceId: process.env.STRIPE_PRO_PRICE_ID || 'price_pro',
        interval: 'month' as const,
        features: [
            'Unlimited brand analysis',
            'AI content generation (100/month)',
            'Advanced SEO tools',
            'Priority community matching',
            'Content templates',
            'Export & save analyses',
            'Email support',
        ],
        limits: {
            brandAnalysisPerDay: -1, // unlimited
            contentGenerationPerMonth: 100,
            seoAnalysisPerMonth: -1, // unlimited
        },
        popular: true,
    },
    ENTERPRISE: {
        id: 'enterprise',
        name: 'Enterprise',
        price: 99,
        priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || 'price_enterprise',
        interval: 'month' as const,
        features: [
            'Everything in Pro',
            'Unlimited AI content generation',
            'API access',
            'White-label options',
            'Custom integrations',
            'Dedicated account manager',
            'Priority support',
            'Custom training',
        ],
        limits: {
            brandAnalysisPerDay: -1,
            contentGenerationPerMonth: -1,
            seoAnalysisPerMonth: -1,
        },
    },
} as const;

export type PlanId = keyof typeof PRICING_PLANS;

/**
 * Create a Stripe checkout session
 */
export async function createCheckoutSession(
    planId: Exclude<PlanId, 'FREE'>,
    userId: string,
    successUrl: string,
    cancelUrl: string
) {
    const plan = PRICING_PLANS[planId];

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
            {
                price: plan.priceId,
                quantity: 1,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        client_reference_id: userId,
        metadata: {
            userId,
            planId,
        },
    });

    return session;
}

/**
 * Create a customer portal session
 */
export async function createPortalSession(customerId: string, returnUrl: string) {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl,
    });

    return session;
}

/**
 * Get subscription status
 */
export async function getSubscriptionStatus(customerId: string) {
    const stripe = getStripe();
    const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'active',
        limit: 1,
    });

    if (subscriptions.data.length === 0) {
        return null;
    }

    const subscription = subscriptions.data[0];
    return {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
    };
}
