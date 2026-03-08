import { Metadata } from 'next';
import { getAllCategories } from '@/lib/pseo/platforms';
import { CATEGORY_ROUTES, SITE_URL, ISR_REVALIDATE } from '@/lib/pseo/constants';
import Breadcrumb from '@/components/pseo/Breadcrumb';
import { WebPageSchema } from '@/components/pseo/StructuredData';

export const revalidate = ISR_REVALIDATE;

export const metadata: Metadata = {
    title: 'Best Startup Platforms by Category | DistriBurst',
    description: 'Explore the best startup directories, communities, and growth platforms ranked and reviewed by category.',
    alternates: { canonical: `${SITE_URL}/best` }
};

export default async function BestHubPage() {
    const categories = await getAllCategories();

    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <WebPageSchema
                title="Best Startup Platforms by Category"
                description="Browse our ranked lists of the best startup platforms."
                url="/best"
            />

            <Breadcrumb items={[{ label: 'Best Of', href: '/best' }]} />

            <h1 className="text-4xl font-bold text-white mb-6">
                Best Startup Platforms by{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                    Category
                </span>
            </h1>
            <p className="text-gray-400 mb-12 max-w-2xl text-lg">
                We've ranked and reviewed hundreds of platforms to help you find the best places
                to launch, distribute, and grow your startup.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((cat) => {
                    const slug = cat.toLowerCase().replace(/\s+/g, '-');
                    const config = CATEGORY_ROUTES[slug] || {
                        title: cat.replace(/\b\w/g, l => l.toUpperCase()),
                        description: `Top ranked platforms in the ${cat} category.`
                    };

                    return (
                        <a
                            key={cat}
                            href={`/best/${slug}`}
                            className="glass rounded-2xl p-6 border border-white/5 hover:border-yellow-500/30 transition-all group relative z-10"
                        >
                            <h2 className="text-xl font-bold text-white group-hover:text-yellow-400 mb-3 capitalize">
                                {config.title}
                            </h2>
                            <p className="text-sm text-gray-400 line-clamp-2">{config.description}</p>
                            <div className="mt-4 text-yellow-500 text-sm font-medium">View Rankings →</div>
                        </a>
                    );
                })}
            </div>
        </div>
    );
}
