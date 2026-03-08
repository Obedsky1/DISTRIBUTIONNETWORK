// Type definitions for the application

export type Platform = 'discord' | 'reddit' | 'telegram' | 'directory' | 'website' | 'other';

export type ActivityLevel = 'low' | 'medium' | 'high';

export type SubmissionStatus = 'pending' | 'approved' | 'rejected';

export type SubscriptionPlan = 'free' | 'premium';

export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'trial';

export type InteractionType = 'view' | 'save' | 'join' | 'dismiss' | 'share';

export type ContentType = 'comment' | 'story' | 'post' | 'caption' | 'bio' | 'reply';

export interface Community {
    id: string;
    name: string;
    slug?: string;
    platform: Platform;
    platformType?: string;
    description: string;
    shortDescription?: string;
    longDescription?: string;
    category: string[];
    niche?: string;
    audience?: string;
    whyJoin?: string;
    whoShouldUseIt?: string;
    stageFit?: string;
    pricingType?: string;
    selfPromoPolicy?: string;
    postingRules?: string;
    moderationStyle?: string;
    whatWorksBest?: string;
    founderStrategy?: string;
    useCases: string[];
    pros?: string[];
    cons?: string[];
    tags: string[];
    relatedCommunitySlugs?: string[];
    alternatives?: { name: string; url: string; description?: string }[];
    faq?: { question: string; answer: string }[];
    externalUrl?: string;
    memberCount: number;
    activityLevel: ActivityLevel;
    url: string;
    imageUrl?: string;
    embedding?: number[];
    lastIndexed?: Date | any;
    lastReviewedAt?: Date | any;
    qualityScore?: number;
    indexable?: boolean;
    canonicalSlug?: string;
    duplicateClusterKey?: string;
    metadata: {
        inviteCode?: string;
        subreddit?: string;
        telegramUsername?: string;
        verified?: boolean;
        [key: string]: any;
    };
    createdAt: Date | any;
    updatedAt: Date | any;
}

export interface User {
    id: string;
    email: string;
    displayName: string;
    photoURL?: string;
    interests: string[];
    interestEmbedding: number[];
    joinedCommunities: string[];
    savedCommunities: string[];
    submittedCommunities: string[];
    isPremium: boolean;
    premiumSince?: any;
    premiumUntil?: any;
    premiumExpiresAt?: Date;
    preferences: {
        platforms: Platform[];
        activityLevel: ActivityLevel | 'any';
        categories: string[];
        notificationSettings: {
            newRecommendations: boolean;
            communityUpdates: boolean;
        };
    };
    stats: {
        totalInteractions: number;
        communitiesJoined: number;
        contentGenerated: number;
    };
    startup?: {
        name: string;
        tagline?: string;
        shortDescription?: string;
        description: string;
        websiteUrl?: string;
        logoUrl?: string;
        bannerUrl?: string;
        industry?: string;
        keywords?: string;
        otherAssets?: string[];
    };
    distroPipeline?: {
        id: string;
        kind: 'community' | 'directory';
        name: string;
        url: string;
        category?: string;
    }[];
    createdAt: Date;
    lastActive: Date;
}

export interface Interaction {
    id: string;
    userId: string;
    communityId: string;
    type: InteractionType;
    timestamp: Date;
    metadata?: {
        duration?: number;
        source?: string;
        [key: string]: any;
    };
}

export interface Submission {
    id: string;
    userId: string;
    communityName: string;
    platform: string;
    url: string;
    description: string;
    category: string[];
    tags: string[];
    status: SubmissionStatus;
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    rejectionReason?: string;
}

export interface Subscription {
    id: string;
    userId: string;
    plan: SubscriptionPlan;
    status: SubscriptionStatus;
    startDate: Date;
    endDate?: Date;
    paymentMethod?: string;
    transactionHistory: Transaction[];
}

export interface Transaction {
    id: string;
    amount: number;
    currency: string;
    status: string;
    date: Date;
}

export interface GeneratedContent {
    id: string;
    userId: string;
    type: ContentType;
    prompt: string;
    generatedText: string;
    platform?: string;
    communityId?: string;
    createdAt: Date;
    rating?: number;
}

export interface RecommendationResult {
    community: Community;
    matchScore: number;
    reason: string;
}

export interface SearchFilters {
    platforms?: Platform[];
    categories?: string[];
    activityLevel?: ActivityLevel;
    minMembers?: number;
    maxMembers?: number;
}

export interface PaginationParams {
    limit: number;
    offset: number;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
}

export type CampaignType = 'seo' | 'betatesters' | 'aiseo' | 'community' | 'pr' | 'launch' | 'reddit_growth' | 'newsletter_outreach' | 'social_media_blitz';
export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface CampaignTarget {
    id: string; // The ID from distroPipeline
    name: string;
    url: string;
    kind: 'community' | 'directory';
    status: 'pending' | 'completed' | 'skipped';
    completedAt?: Date | null | any;
    submissionUrl?: string | null; // URL the user pastes when marking as done
}

export interface Campaign {
    id?: string;
    userId: string;
    type: CampaignType;
    status: CampaignStatus;
    name: string;
    createdAt?: Date | any; // allow any for Firestore Timestamp
    updatedAt?: Date | any;
    config?: Record<string, any>;
    targets: CampaignTarget[];
    currentBatchIndex: number; // Groups of 3 targets
    submissions?: {
        directoryId: string;
        status: string;
        submittedAt: Date | any;
    }[];
}
