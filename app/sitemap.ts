import { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/pseo/constants';

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: `${SITE_URL}/sitemaps/platforms`,
            lastModified: new Date(),
        },
        {
            url: `${SITE_URL}/sitemaps/categories`,
            lastModified: new Date(),
        },
        {
            url: `${SITE_URL}/sitemaps/comparisons`,
            lastModified: new Date(),
        },
        {
            url: `${SITE_URL}/sitemaps/guides`,
            lastModified: new Date(),
        },
        {
            url: `${SITE_URL}/sitemaps/glossary`,
            lastModified: new Date(),
        },
    ];
}
