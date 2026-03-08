import { NextResponse } from 'next/server';
import { getAllCommunities, enrichCommunityForSEO } from '@/lib/community';
import { SITE_URL } from '@/lib/pseo/constants';

export async function GET() {
    const communities = await getAllCommunities();
    const indexableCommunities = communities
        .map(enrichCommunityForSEO)
        .filter(c => c.indexable);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      ${indexableCommunities
            .map((c) => {
                return `
        <url>
          <loc>${SITE_URL}/community/${c.slug}</loc>
          <lastmod>${c.updatedAt ? new Date(c.updatedAt).toISOString() : new Date().toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.7</priority>
        </url>
      `;
            })
            .join('')}
    </urlset>
  `;

    return new NextResponse(sitemap, {
        headers: {
            'Content-Type': 'application/xml',
        },
    });
}
