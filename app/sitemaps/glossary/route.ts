import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/pseo/constants';

// Manual static list of terms for now, matching app/(seo)/glossary/[term]/page.tsx
const TERMS = [
    'domain-authority',
    'dofollow-backlink',
    'nofollow-backlink',
    'saas',
    'indie-hacker',
    'startup-directory',
];

export async function GET() {
    const sitemap = TERMS.map((term) => ({
        url: `${SITE_URL}/glossary/${term}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.6,
    }));

    // Add main glossary page
    sitemap.unshift({
        url: `${SITE_URL}/glossary`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
    });

    return new Response(
        `<?xml version="1.0" encoding="UTF-8"?>
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
            ${sitemap
            .map(
                (item) => `
                <url>
                    <loc>${item.url}</loc>
                    <lastmod>${item.lastModified.toISOString()}</lastmod>
                    <changefreq>${item.changeFrequency}</changefreq>
                    <priority>${item.priority}</priority>
                </url>`
            )
            .join('')}
        </urlset>`,
        {
            headers: {
                'Content-Type': 'application/xml',
            },
        }
    );
}
