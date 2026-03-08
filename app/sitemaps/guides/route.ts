import { NextResponse } from 'next/server';
import { getAllPlatforms } from '@/lib/pseo/platforms';
import { SITE_URL } from '@/lib/pseo/constants';

export async function GET() {
    const platforms = await getAllPlatforms();

    const urls = platforms.map((p) => `
    <url>
      <loc>${SITE_URL}/submit-to-${p.slug}</loc>
      <lastmod>${p.last_verified_at || new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`);

    // Add the hub page itself
    const hubUrl = `
    <url>
      <loc>${SITE_URL}/how-to-submit</loc>
      <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>0.9</priority>
    </url>`;

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${hubUrl}
  ${urls.join('')}
</urlset>`;

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml',
            'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
    });
}
