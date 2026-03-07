import { SEOPlatform, PlatformValidationResult } from '@/types/platform';
import { REQUIRED_FIELDS, MIN_DESCRIPTION_LENGTH } from './constants';

/**
 * Validate a platform document for SEO page generation.
 * Returns whether the page should render and whether it should be indexed.
 */
export function validatePlatform(platform: SEOPlatform | null): PlatformValidationResult {
    if (!platform) {
        return {
            isValid: false,
            isIndexable: false,
            errors: ['Platform not found'],
            warnings: [],
        };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    for (const field of REQUIRED_FIELDS) {
        const value = platform[field];
        if (value === undefined || value === null || value === '') {
            errors.push(`Missing required field: ${field}`);
        }
    }

    // Check submission link
    if (!platform.submissionLink) {
        errors.push('Missing submissionLink');
    } else if (!isValidUrl(platform.submissionLink)) {
        warnings.push('submissionLink is not a valid URL');
    }

    // Check minimum content length
    if (platform.description && platform.description.length < MIN_DESCRIPTION_LENGTH) {
        warnings.push(`Description is shorter than ${MIN_DESCRIPTION_LENGTH} characters`);
    }

    // Check SEO data completeness for indexability
    const seoFields = [
        'pricing',
        'approval_time',
        'requirements',
        'submission_steps',
        'audience',
    ] as const;

    const missingSeoFields = seoFields.filter((f) => {
        const val = platform[f];
        if (Array.isArray(val)) return val.length === 0;
        return !val;
    });

    if (missingSeoFields.length > 0) {
        warnings.push(`Missing SEO fields: ${missingSeoFields.join(', ')}`);
    }

    // Determine indexability: valid + enough SEO data
    const isValid = errors.length === 0;
    const isIndexable = isValid && missingSeoFields.length <= 2; // Allow up to 2 missing SEO fields

    return { isValid, isIndexable, errors, warnings };
}

/**
 * Validate all platforms and return a report.
 */
export function validateAllPlatforms(
    platforms: SEOPlatform[]
): {
    total: number;
    valid: number;
    indexable: number;
    issues: { slug: string; errors: string[]; warnings: string[] }[];
} {
    const issues: { slug: string; errors: string[]; warnings: string[] }[] = [];
    let valid = 0;
    let indexable = 0;

    for (const p of platforms) {
        const result = validatePlatform(p);
        if (result.isValid) valid++;
        if (result.isIndexable) indexable++;
        if (result.errors.length > 0 || result.warnings.length > 0) {
            issues.push({ slug: p.slug || '(no slug)', errors: result.errors, warnings: result.warnings });
        }
    }

    return { total: platforms.length, valid, indexable, issues };
}

function isValidUrl(str: string): boolean {
    try {
        new URL(str);
        return true;
    } catch {
        return false;
    }
}
