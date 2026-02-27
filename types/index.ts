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
    platform: Platform;
    description: string;
    category: string[];
    tags: string[];
    memberCount: number;
    activityLevel: ActivityLevel;
    url: string;
    imageUrl?: string;
    embedding: number[];
    lastIndexed: Date;
    metadata: {
        inviteCode?: string;
        subreddit?: string;
        telegramUsername?: string;
        verified?: boolean;
        [key: string]: any;
    };
    createdAt: Date;
    updatedAt: Date;
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
