import { NextResponse } from 'next/server';
import { getAllPlatforms } from '@/lib/pseo/platforms';
import { validateAllPlatforms } from '@/lib/pseo/validation';

/**
 * SEO Validate endpoint.
 * Runs validation on all platforms and returns a detailed report.
 */
export async function GET() {
    try {
        const platforms = await getAllPlatforms();
        const report = validateAllPlatforms(platforms);

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            summary: {
                total: report.total,
                valid: report.valid,
                indexable: report.indexable,
                withErrors: report.issues.filter((i) => i.errors.length > 0).length,
                withWarnings: report.issues.filter((i) => i.warnings.length > 0 && i.errors.length === 0).length,
            },
            issues: report.issues,
        });
    } catch (error: any) {
        return NextResponse.json(
            { status: 'error', message: error.message },
            { status: 500 }
        );
    }
}
