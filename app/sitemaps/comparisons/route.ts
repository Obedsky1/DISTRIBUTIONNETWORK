import { NextResponse } from 'next/server';
import { getAllPlatforms } from '@/lib/pseo/platforms';
import { generateComparisonPairs } from '@/lib/pseo/comparisons';
import { SITE_URL } from '@/lib/pseo/constants';

export async function GET() {
    const platforms = await getAllPlatforms();
    const pairs = generateComparisonPairs(platforms);

    const urls = pairs.map((pair) => `
    <url>
      <loc>${SITE_URL}/compare/${pair.combinedSlug}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`);

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('')}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    });
}
