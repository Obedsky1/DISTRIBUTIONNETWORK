import { NextRequest, NextResponse } from 'next/server';
import { runAllScrapers, runSingleScraper } from '@/lib/scrapers/orchestrator';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { platform, adminKey } = body;

        // Verify admin access
        if (adminKey !== process.env.ADMIN_SECRET_KEY) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                },
                { status: 401 }
            );
        }

        let result;

        if (platform && platform !== 'all') {
            // Run single platform scraper
            console.log(`Starting ${platform} scraper...`);
            const communities = await runSingleScraper(platform);
            result = {
                success: true,
                totalScraped: communities.length,
                platform,
            };
        } else {
            // Run all scrapers
            console.log('Starting all scrapers...');
            result = await runAllScrapers();
        }

        return NextResponse.json({
            success: true,
            data: result,
        });
    } catch (error: any) {
        console.error('Error running scrapers:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Scraping failed',
            },
            { status: 500 }
        );
    }
}
