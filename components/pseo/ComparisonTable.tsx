import { SEOPlatform } from '@/types/platform';

interface ComparisonTableProps {
    platformA: SEOPlatform;
    platformB: SEOPlatform;
}

export default function ComparisonTable({ platformA, platformB }: ComparisonTableProps) {
    const rows: { label: string; valueA: string; valueB: string }[] = [
        { label: 'Type', valueA: platformA.type, valueB: platformB.type },
        { label: 'Category', valueA: platformA.category || '-', valueB: platformB.category || '-' },
        { label: 'Domain Authority', valueA: String(platformA.domainAuthority || '-'), valueB: String(platformB.domainAuthority || '-') },
        { label: 'Backlink Type', valueA: platformA.backlinkType || '-', valueB: platformB.backlinkType || '-' },
        { label: 'Pricing', valueA: platformA.pricing || '-', valueB: platformB.pricing || '-' },
        { label: 'Approval Time', valueA: platformA.approval_time || '-', valueB: platformB.approval_time || '-' },
        { label: 'Audience', valueA: platformA.audience || '-', valueB: platformB.audience || '-' },
        { label: 'Geo Focus', valueA: platformA.geo_focus || '-', valueB: platformB.geo_focus || '-' },
        { label: 'Requirements', valueA: platformA.requirements?.join(', ') || '-', valueB: platformB.requirements?.join(', ') || '-' },
        { label: 'Steps to Submit', valueA: String(platformA.submission_steps?.length || '-'), valueB: String(platformB.submission_steps?.length || '-') },
        { label: 'Best Time to Post', valueA: platformA.best_time_to_post || '-', valueB: platformB.best_time_to_post || '-' },
    ];

    return (
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="border-b border-white/10">
                        <th className="text-left py-3 px-4 text-sm text-gray-400 font-medium w-1/3">Feature</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-purple-300 w-1/3">{platformA.name}</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-pink-300 w-1/3">{platformB.name}</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row, i) => (
                        <tr
                            key={row.label}
                            className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}
                        >
                            <td className="py-3 px-4 text-sm text-gray-400 font-medium">{row.label}</td>
                            <td className="py-3 px-4 text-sm text-gray-200">{row.valueA}</td>
                            <td className="py-3 px-4 text-sm text-gray-200">{row.valueB}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
