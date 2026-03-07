import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getAllPlatforms, getAllGeoLocations, getPlatformsByGeo } from '@/lib/pseo/platforms';
import { WebPageSchema, ItemListSchema } from '@/components/pseo/StructuredData';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import PlatformCard from '@/components/pseo/PlatformCard';
import { SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';

export const revalidate = ISR_REVALIDATE;

export async function generateStaticParams() {
    const platforms = await getAllPlatforms();
    const geos = new Set<string>();
    platforms.forEach((p) => {
        if (p.geo_focus) {
            p.geo_focus.split(',').forEach((g) => {
                const trimmed = g.trim().toLowerCase();
                if (trimmed && trimmed !== 'global') {
                    // Generate slugs like "startup-directories-usa"
                    ['directories', 'communities', 'groups'].forEach((type) => {
                        geos.add(`startup-${type}-${trimmed.replace(/\s+/g, '-')}`);
                    });
                }
            });
        }
    });
    return Array.from(geos).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const label = params.slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    return {
        title: `${label} | DistriBurst`,
        description: `Find the best ${label.toLowerCase()}. Curated platforms for your location.`,
        alternates: { canonical: `${SITE_URL}/locations/${params.slug}` },
    };
}

export default async function LocationPage({ params }: { params: { slug: string } }) {
    // Parse slug: startup-directories-usa -> type=directories, geo=usa
    const parts = params.slug.split('-');
    const geoKeyword = parts.slice(2).join(' '); // "usa", "india", "uk"
    const typeKeyword = parts[1]; // "directories", "communities", "groups"

    const allPlatforms = await getAllPlatforms();
    let platforms = allPlatforms.filter((p) => {
        const geoMatch = p.geo_focus?.toLowerCase().includes(geoKeyword) || p.geo_focus?.toLowerCase() === 'global';
        if (!geoMatch) return false;
        if (typeKeyword === 'directories') return p.type === 'directory';
        if (typeKeyword === 'communities') return p.type === 'community';
        if (typeKeyword === 'groups') return p.type === 'group';
        return true;
    });

    const label = params.slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    if (platforms.length === 0) {
        // Still render the page for geo pages with global platforms
        platforms = allPlatforms.filter((p) => p.geo_focus?.toLowerCase() === 'global').slice(0, 20);
    }

    return (
        <>
            <WebPageSchema title={label} description={`Best ${label.toLowerCase()}`} url={`/locations/${params.slug}`} />
            <ItemListSchema items={platforms.slice(0, 20).map((p, i) => ({ name: p.name, url: `/platform/${p.slug}`, position: i + 1 }))} name={label} />

            <Breadcrumb items={[
                { label: 'Locations', href: '/locations/startup-directories-usa' },
                { label, href: `/locations/${params.slug}` },
            ]} />

            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                    {label}
                </span>
            </h1>
            <p className="text-gray-400 mb-8 max-w-2xl">
                Find the best {typeKeyword} in {geoKeyword.replace(/\b\w/g, (l) => l.toUpperCase())} for your startup.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {platforms.map((p) => (
                    <PlatformCard key={p.slug} platform={p} />
                ))}
            </div>
        </>
    );
}
