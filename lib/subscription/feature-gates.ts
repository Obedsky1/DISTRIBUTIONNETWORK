import { PRICING_PLANS, PlanId } from '../stripe/config';

export interface UserSubscription {
    planId: PlanId;
    customerId?: string;
    subscriptionId?: string;
    status: 'active' | 'canceled' | 'past_due' | 'trialing';
    currentPeriodEnd?: Date;
}

export interface UsageStats {
    brandAnalysisToday: number;
    contentGenerationThisMonth: number;
    seoAnalysisThisMonth: number;
}

/**
 * Check if a feature is available for the user's subscription
 */
export function canAccessFeature(
    subscription: UserSubscription,
    feature: 'brandAnalysis' | 'contentGeneration' | 'seoAnalysis',
    usage: UsageStats
): { allowed: boolean; reason?: string } {
    const plan = PRICING_PLANS[subscription.planId];
    const limits = plan.limits;

    switch (feature) {
        case 'brandAnalysis':
            if (limits.brandAnalysisPerDay === -1) {
                return { allowed: true };
            }
            if (usage.brandAnalysisToday >= limits.brandAnalysisPerDay) {
                return {
                    allowed: false,
                    reason: `Daily limit of ${limits.brandAnalysisPerDay} brand analyses reached. Upgrade to Pro for unlimited access.`,
                };
            }
            return { allowed: true };

        case 'contentGeneration':
            if (limits.contentGenerationPerMonth === 0) {
                return {
                    allowed: false,
                    reason: 'Content generation is not available on the Free plan. Upgrade to Pro to unlock this feature.',
                };
            }
            if (limits.contentGenerationPerMonth === -1) {
                return { allowed: true };
            }
            if (usage.contentGenerationThisMonth >= limits.contentGenerationPerMonth) {
                return {
                    allowed: false,
                    reason: `Monthly limit of ${limits.contentGenerationPerMonth} content generations reached. Upgrade to Enterprise for unlimited access.`,
                };
            }
            return { allowed: true };

        case 'seoAnalysis':
            if (limits.seoAnalysisPerMonth === -1) {
                return { allowed: true };
            }
            if (usage.seoAnalysisThisMonth >= limits.seoAnalysisPerMonth) {
                return {
                    allowed: false,
                    reason: `Monthly limit of ${limits.seoAnalysisPerMonth} SEO analyses reached. Upgrade to Pro for unlimited access.`,
                };
            }
            return { allowed: true };

        default:
            return { allowed: false, reason: 'Unknown feature' };
    }
}

/**
 * Get upgrade suggestion based on current plan
 */
export function getUpgradeSuggestion(currentPlan: PlanId): {
    suggestedPlan: PlanId;
    benefits: string[];
} | null {
    if (currentPlan === 'FREE') {
        return {
            suggestedPlan: 'PRO',
            benefits: [
                'Unlimited brand analysis',
                '100 AI content generations per month',
                'Advanced SEO tools',
                'Export and save analyses',
            ],
        };
    }

    if (currentPlan === 'PRO') {
        return {
            suggestedPlan: 'ENTERPRISE',
            benefits: [
                'Unlimited AI content generation',
                'API access',
                'White-label options',
                'Dedicated account manager',
            ],
        };
    }

    return null;
}

/**
 * Calculate usage percentage for display
 */
export function calculateUsagePercentage(
    subscription: UserSubscription,
    usage: UsageStats
): {
    brandAnalysis: number;
    contentGeneration: number;
    seoAnalysis: number;
} {
    const plan = PRICING_PLANS[subscription.planId];
    const limits = plan.limits;

    return {
        brandAnalysis:
            limits.brandAnalysisPerDay === -1
                ? 0
                : (usage.brandAnalysisToday / limits.brandAnalysisPerDay) * 100,
        contentGeneration:
            limits.contentGenerationPerMonth === -1 || limits.contentGenerationPerMonth === 0
                ? 0
                : (usage.contentGenerationThisMonth / limits.contentGenerationPerMonth) * 100,
        seoAnalysis:
            limits.seoAnalysisPerMonth === -1
                ? 0
                : (usage.seoAnalysisThisMonth / limits.seoAnalysisPerMonth) * 100,
    };
}
