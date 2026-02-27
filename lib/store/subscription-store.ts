import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserSubscription, UsageStats } from '../subscription/feature-gates';

interface SubscriptionStore {
    subscription: UserSubscription | null;
    usage: UsageStats;
    setSubscription: (subscription: UserSubscription) => void;
    updateUsage: (usage: Partial<UsageStats>) => void;
    incrementUsage: (type: keyof UsageStats) => void;
    resetDailyUsage: () => void;
    resetMonthlyUsage: () => void;
}

export const useSubscriptionStore = create<SubscriptionStore>()(
    persist(
        (set) => ({
            subscription: {
                planId: 'FREE',
                status: 'active',
            },
            usage: {
                brandAnalysisToday: 0,
                contentGenerationThisMonth: 0,
                seoAnalysisThisMonth: 0,
            },
            setSubscription: (subscription) => set({ subscription }),
            updateUsage: (usage) =>
                set((state) => ({
                    usage: { ...state.usage, ...usage },
                })),
            incrementUsage: (type) =>
                set((state) => ({
                    usage: {
                        ...state.usage,
                        [type]: state.usage[type] + 1,
                    },
                })),
            resetDailyUsage: () =>
                set((state) => ({
                    usage: {
                        ...state.usage,
                        brandAnalysisToday: 0,
                    },
                })),
            resetMonthlyUsage: () =>
                set((state) => ({
                    usage: {
                        ...state.usage,
                        contentGenerationThisMonth: 0,
                        seoAnalysisThisMonth: 0,
                    },
                })),
        }),
        {
            name: 'subscription-storage',
        }
    )
);
