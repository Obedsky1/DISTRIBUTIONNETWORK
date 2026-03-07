import { SEOPlatform, PlatformScore } from '@/types/platform';

/**
 * Compute a curation/ranking score for a platform.
 * Used by "best" pages to rank and display platforms.
 */
export function scorePlatform(platform: SEOPlatform): PlatformScore {
    const da = scoreDomainAuthority(platform.domainAuthority);
    const pricing = scorePricing(platform.pricing);
    const approval = scoreApprovalSpeed(platform.approval_time);
    const audience = scoreAudienceFit(platform);
    const difficulty = scoreDifficulty(platform);

    const totalScore = Math.round(
        da * 0.30 + pricing * 0.15 + approval * 0.15 + audience * 0.20 + difficulty * 0.20
    );

    return {
        platform,
        totalScore,
        breakdown: {
            domainAuthority: da,
            pricing,
            approvalSpeed: approval,
            audienceFit: audience,
            difficulty,
        },
    };
}

/**
 * Score and rank platforms for a "best" page.
 */
export function rankPlatforms(platforms: SEOPlatform[]): PlatformScore[] {
    return platforms
        .map(scorePlatform)
        .sort((a, b) => b.totalScore - a.totalScore);
}

// ─── Scoring helpers (0–100 scale) ───

function scoreDomainAuthority(da: number | undefined): number {
    if (!da || da <= 0) return 10;
    if (da >= 90) return 100;
    if (da >= 70) return 85;
    if (da >= 50) return 70;
    if (da >= 30) return 50;
    return 30;
}

function scorePricing(pricing: string | undefined): number {
    if (!pricing) return 50;
    const p = pricing.toLowerCase();
    if (p === 'free') return 100;
    if (p.includes('freemium') || p.includes('free tier')) return 80;
    if (p.includes('paid')) return 30;
    return 50;
}

function scoreApprovalSpeed(approvalTime: string | undefined): number {
    if (!approvalTime) return 50;
    const t = approvalTime.toLowerCase();
    if (t.includes('instant') || t.includes('immediate')) return 100;
    if (t.includes('hour')) {
        const hours = parseInt(t) || 24;
        if (hours <= 1) return 95;
        if (hours <= 24) return 80;
        return 60;
    }
    if (t.includes('day')) {
        const days = parseInt(t) || 7;
        if (days <= 1) return 80;
        if (days <= 3) return 65;
        if (days <= 7) return 50;
        return 35;
    }
    if (t.includes('week')) return 35;
    return 50;
}

function scoreAudienceFit(platform: SEOPlatform): number {
    let score = 50;
    if (platform.audience) {
        const a = platform.audience.toLowerCase();
        if (a.includes('startup') || a.includes('founder')) score += 20;
        if (a.includes('saas') || a.includes('tech')) score += 15;
        if (a.includes('developer') || a.includes('maker')) score += 10;
    }
    if (platform.tags?.length > 0) score += Math.min(platform.tags.length * 3, 15);
    return Math.min(score, 100);
}

function scoreDifficulty(platform: SEOPlatform): number {
    // Lower difficulty = higher score (easier platforms rank higher)
    let difficulty = 50;
    if (platform.requirements) {
        if (platform.requirements.length <= 2) difficulty = 80;
        else if (platform.requirements.length <= 4) difficulty = 60;
        else difficulty = 40;
    }
    if (platform.submission_steps) {
        if (platform.submission_steps.length <= 3) difficulty += 10;
        else if (platform.submission_steps.length > 6) difficulty -= 10;
    }
    return Math.min(Math.max(difficulty, 0), 100);
}

/**
 * Human-readable labels for score breakdown display.
 */
export const SCORE_LABELS: Record<keyof PlatformScore['breakdown'], string> = {
    domainAuthority: 'Domain Authority',
    pricing: 'Pricing Value',
    approvalSpeed: 'Approval Speed',
    audienceFit: 'Audience Fit',
    difficulty: 'Ease of Submission',
};
