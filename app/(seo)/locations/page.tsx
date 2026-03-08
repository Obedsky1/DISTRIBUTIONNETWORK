import { Metadata } from 'next';
import { getAllGeoLocations } from '@/lib/pseo/platforms';
import { SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import { WebPageSchema } from '@/components/pseo/StructuredData';

export const revalidate = ISR_REVALIDATE;

export const metadata: Metadata = {
    title: 'Niche Startup Communities by Location | DistriBurst',
    description: 'Find regional startup communities and directories to grow your local presence.',
    alternates: { canonical: `${SITE_URL}/locations` }
};

export default async function LocationsHubPage() {
    const locations = await getAllGeoLocations();

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <WebPageSchema
                title="Browse by Location"
                description="Find startup platforms serving specific geographic regions."
                url="/locations"
            />

            <Breadcrumb items={[{ label: 'Locations', href: '/locations' }]} />

            <h1 className="text-4xl font-bold text-white mb-6">
                Regional{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                    Communities
                </span>
            </h1>
            <p className="text-gray-400 mb-12 max-w-2xl text-lg">
                Looking to build local traction? Discover directories and communities
                focused on specific geographic regions and cities.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {locations.map((loc) => (
                    <a
                        key={loc}
                        href={`/locations/${loc.toLowerCase()}`}
                        className="p-6 rounded-2xl glass border border-white/5 hover:border-emerald-500/30 transition-all group text-center relative z-10"
                    >
                        <h2 className="text-lg font-bold text-white group-hover:text-emerald-400 capitalize">
                            {loc}
                        </h2>
                    </a>
                ))}
            </div>
        </div>
    );
}
