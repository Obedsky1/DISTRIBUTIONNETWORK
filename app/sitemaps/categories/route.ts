import { NextResponse } from 'next/server';
import { SITE_URL, PERSONAS, USE_CASES } from '@/lib/pseo/constants';
import { getAllTags, getAllGeoLocations, getAllPlatforms } from '@/lib/pseo/platforms';

export async function GET() {
  const tags = await getAllTags();
  const geos = await getAllGeoLocations();
  const allPlatforms = await getAllPlatforms();

  const urls: string[] = [];

  // Category pages
  const categories = [
    'startup-directories',
    'startup-communities',
    'startup-telegram-groups',
    'startup-discord-groups',
    'startup-slack-groups',
  ];

  categories.forEach((cat) => {
    urls.push(`
    <url>
      <loc>${SITE_URL}/${cat}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);
  });

  // Best pages
  ['startup-directories', 'saas-communities', 'product-launch-platforms'].forEach((cat) => {
    urls.push(`
    <url>
      <loc>${SITE_URL}/best/${cat}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);
  });

  // Persona pages
  PERSONAS.forEach((p) => {
    urls.push(`
    <url>
      <loc>${SITE_URL}/for/${p.slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`);
  });

  // Use-case pages
  USE_CASES.forEach((u) => {
    urls.push(`
    <url>
      <loc>${SITE_URL}/promote/${u.slug}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.6</priority>
    </url>`);
  });

  // Tag pages
  tags.forEach((tag) => {
    urls.push(`
    <url>
      <loc>${SITE_URL}/tag/${tag}</loc>
      <changefreq>weekly</changefreq>
      <priority>0.5</priority>
    </url>`);
  });

  // Location pages
  geos.forEach((geo) => {
    const slug = geo.replace(/\s+/g, '-');
    ['directories', 'communities', 'groups'].forEach((type) => {
      urls.push(`
    <url>
      <loc>${SITE_URL}/locations/startup-${type}-${slug}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.5</priority>
    </url>`);
    });
  });

  // Free directories
  urls.push(`
    <url>
      <loc>${SITE_URL}/free-startup-directories</loc>
      <changefreq>weekly</changefreq>
      <priority>0.7</priority>
    </url>`);

  // Alternatives pages (DA >= 40)
  allPlatforms
    .filter((p) => p.domainAuthority >= 40)
    .forEach((p) => {
      urls.push(`
    <url>
      <loc>${SITE_URL}/alternatives/${p.slug}</loc>
      <changefreq>monthly</changefreq>
      <priority>0.6</priority>
    </url>`);
    });

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
