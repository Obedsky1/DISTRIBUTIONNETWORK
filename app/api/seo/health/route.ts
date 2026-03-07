import { NextResponse } from 'next/server';
import { getAllPlatforms, getAllTags, getAllGeoLocations, getAllCategories } from '@/lib/pseo/platforms';
import { generateComparisonPairs } from '@/lib/pseo/comparisons';
import { validateAllPlatforms } from '@/lib/pseo/validation';

/**
 * SEO Health Check endpoint.
 * Returns dataset stats, page counts, and sitemap status.
 */
export async function GET() {
    try {
        const platforms = await getAllPlatforms();
        const tags = await getAllTags();
        const geos = await getAllGeoLocations();
        const categories = await getAllCategories();
        const comparisons = generateComparisonPairs(platforms);
        const validation = validateAllPlatforms(platforms);

        const health = {
            status: 'ok',
            timestamp: new Date().toISOString(),
            dataset: {
                totalPlatforms: platforms.length,
                directories: platforms.filter((p) => p.type === 'directory').length,
                communities: platforms.filter((p) => p.type === 'community').length,
                groups: platforms.filter((p) => p.type === 'group').length,
                uniqueTags: tags.length,
                uniqueGeos: geos.length,
                uniqueCategories: categories.length,
            },
            validation: {
                valid: validation.valid,
                indexable: validation.indexable,
                withIssues: validation.issues.length,
            },
            generatedPages: {
                platformPages: platforms.length,
                submissionGuides: platforms.length,
                comparisonPages: comparisons.length,
                categoryPages: 5,
                bestPages: categories.length,
                personaPages: 3,
                useCasePages: 3,
                tagPages: tags.length,
                locationPages: geos.length * 3,
                estimatedTotal:
                    platforms.length * 2 + comparisons.length + 5 + categories.length + 3 + 3 + tags.length + geos.length * 3,
            },
            sitemaps: [
                '/sitemaps/platforms',
                '/sitemaps/categories',
                '/sitemaps/comparisons',
            ],
        };

        return NextResponse.json(health);
    } catch (error: any) {
        return NextResponse.json(
            { status: 'error', message: error.message },
            { status: 500 }
        );
    }
}
