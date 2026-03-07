// ─── PSEO Platform Types ───

export interface SEOPlatform {
    id?: string;
    name: string;
    slug: string;
    type: 'directory' | 'community' | 'group';
    category: string;
    description: string;
    domainAuthority: number;
    backlinkType: 'dofollow' | 'nofollow' | 'ugc' | 'sponsored' | 'none';
    submissionLink: string;
    tags: string[];
    createdAt: string;

    // SEO data fields
    pricing: string;
    approval_time: string;
    requirements: string[];
    submission_steps: string[];
    rules: string;
    best_time_to_post: string;
    audience: string;
    geo_focus: string;
    contact_or_support_link: string;
    last_verified_at: string;
}

export interface PlatformRedirect {
    id?: string;
    old_slug: string;
    new_slug: string;
}

export interface PlatformValidationResult {
    isValid: boolean;
    isIndexable: boolean;
    errors: string[];
    warnings: string[];
}

export interface PlatformScore {
    platform: SEOPlatform;
    totalScore: number;
    breakdown: {
        domainAuthority: number;
        pricing: number;
        approvalSpeed: number;
        audienceFit: number;
        difficulty: number;
    };
}

export interface ComparisonPair {
    slugA: string;
    slugB: string;
    nameA: string;
    nameB: string;
    category: string;
    combinedSlug: string; // "product-hunt-vs-beta-list"
}

export interface InternalLinks {
    relatedPlatforms: Pick<SEOPlatform, 'name' | 'slug' | 'type'>[];
    relatedCommunities: Pick<SEOPlatform, 'name' | 'slug' | 'type'>[];
    alternativeDirectories: Pick<SEOPlatform, 'name' | 'slug' | 'type'>[];
    categoryPage: string | null;
    comparisonPages: { slug: string; label: string }[];
    personaPages: { slug: string; label: string }[];
    useCasePages: { slug: string; label: string }[];
}

// Persona & use-case mapping types
export interface PersonaDefinition {
    slug: string;
    label: string;
    description: string;
    keywords: string[];
    audienceMatch: string[];
}

export interface UseCaseDefinition {
    slug: string;
    label: string;
    description: string;
    keywords: string[];
    categoryMatch: string[];
}
