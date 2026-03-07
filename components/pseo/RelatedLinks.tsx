import Link from 'next/link';
import { InternalLinks } from '@/types/platform';

interface RelatedLinksProps {
    links: InternalLinks;
}

export default function RelatedLinks({ links }: RelatedLinksProps) {
    const hasAnyLinks =
        links.relatedPlatforms.length > 0 ||
        links.relatedCommunities.length > 0 ||
        links.alternativeDirectories.length > 0 ||
        links.categoryPage ||
        links.comparisonPages.length > 0 ||
        links.personaPages.length > 0 ||
        links.useCasePages.length > 0;

    if (!hasAnyLinks) return null;

    return (
        <aside className="glass rounded-xl p-6 space-y-6">
            <h3 className="text-lg font-semibold text-white">Related Resources</h3>

            {links.relatedPlatforms.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-purple-300 mb-2">Related Platforms</h4>
                    <ul className="space-y-1.5">
                        {links.relatedPlatforms.map((p) => (
                            <li key={p.slug}>
                                <Link
                                    href={`/platform/${p.slug}`}
                                    className="text-sm text-gray-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                                >
                                    <span className="text-gray-600">→</span> {p.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {links.relatedCommunities.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-blue-300 mb-2">Related Communities</h4>
                    <ul className="space-y-1.5">
                        {links.relatedCommunities.map((p) => (
                            <li key={p.slug}>
                                <Link
                                    href={`/platform/${p.slug}`}
                                    className="text-sm text-gray-400 hover:text-blue-300 transition-colors flex items-center gap-1"
                                >
                                    <span className="text-gray-600">→</span> {p.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {links.alternativeDirectories.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-emerald-300 mb-2">Alternative Directories</h4>
                    <ul className="space-y-1.5">
                        {links.alternativeDirectories.map((p) => (
                            <li key={p.slug}>
                                <Link
                                    href={`/platform/${p.slug}`}
                                    className="text-sm text-gray-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                                >
                                    <span className="text-gray-600">→</span> {p.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {links.categoryPage && (
                <div>
                    <h4 className="text-sm font-medium text-yellow-300 mb-2">Browse Category</h4>
                    <Link
                        href={links.categoryPage}
                        className="text-sm text-gray-400 hover:text-yellow-300 transition-colors flex items-center gap-1"
                    >
                        <span className="text-gray-600">→</span> View all in this category
                    </Link>
                </div>
            )}

            {links.comparisonPages.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-pink-300 mb-2">Comparisons</h4>
                    <ul className="space-y-1.5">
                        {links.comparisonPages.map((c) => (
                            <li key={c.slug}>
                                <Link
                                    href={`/compare/${c.slug}`}
                                    className="text-sm text-gray-400 hover:text-pink-300 transition-colors flex items-center gap-1"
                                >
                                    <span className="text-gray-600">→</span> {c.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {links.personaPages.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-orange-300 mb-2">Audience Pages</h4>
                    <ul className="space-y-1.5">
                        {links.personaPages.map((p) => (
                            <li key={p.slug}>
                                <Link
                                    href={`/for/${p.slug}`}
                                    className="text-sm text-gray-400 hover:text-orange-300 transition-colors flex items-center gap-1"
                                >
                                    <span className="text-gray-600">→</span> {p.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {links.useCasePages.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium text-cyan-300 mb-2">Use Cases</h4>
                    <ul className="space-y-1.5">
                        {links.useCasePages.map((u) => (
                            <li key={u.slug}>
                                <Link
                                    href={`/promote/${u.slug}`}
                                    className="text-sm text-gray-400 hover:text-cyan-300 transition-colors flex items-center gap-1"
                                >
                                    <span className="text-gray-600">→</span> {u.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </aside>
    );
}
