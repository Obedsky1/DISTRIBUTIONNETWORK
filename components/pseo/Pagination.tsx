// ─── Pagination Component ───

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    basePath: string; // e.g. '/startup-directories'
}

export default function Pagination({ currentPage, totalPages, basePath }: PaginationProps) {
    if (totalPages <= 1) return null;

    const getPageLink = (page: number) => {
        if (page === 1) return basePath;
        return `${basePath}/${page}`;
    };

    // Generate page numbers to show
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 7) {
        for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
        pages.push(1);
        if (currentPage > 3) pages.push('ellipsis');
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 2) pages.push('ellipsis');
        pages.push(totalPages);
    }

    return (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-2 mt-10">
            {currentPage > 1 && (
                <a
                    href={getPageLink(currentPage - 1)}
                    className="px-3 py-2 rounded-lg glass text-sm text-gray-300 hover:text-white hover:border-purple-500/40 transition-all duration-200 relative z-10"
                >
                    ← Previous
                </a>
            )}

            <div className="flex items-center gap-1">
                {pages.map((page, i) =>
                    page === 'ellipsis' ? (
                        <span key={`ellipsis-${i}`} className="px-2 text-gray-600">...</span>
                    ) : (
                        <a
                            key={page}
                            href={getPageLink(page)}
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm transition-all duration-200 relative z-10 ${page === currentPage
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold'
                                : 'glass text-gray-400 hover:text-white hover:border-purple-500/40'
                                }`}
                        >
                            {page}
                        </a>
                    )
                )}
            </div>

            {currentPage < totalPages && (
                <a
                    href={getPageLink(currentPage + 1)}
                    className="px-3 py-2 rounded-lg glass text-sm text-gray-300 hover:text-white hover:border-purple-500/40 transition-all duration-200 relative z-10"
                >
                    Next →
                </a>
            )}
        </nav>
    );
}
