import { NextResponse } from 'next/server';
import communitiesData from '@/data/communities.json';

export async function GET() {
    const communities = communitiesData.communities;

    // Calculate platform counts
    const platforms: Record<string, number> = {};
    communities.forEach(c => {
        platforms[c.platform] = (platforms[c.platform] || 0) + 1;
    });

    // Calculate category counts
    const categoryMap: Record<string, number> = {};
    communities.forEach(c => {
        c.categories.forEach(cat => {
            categoryMap[cat] = (categoryMap[cat] || 0) + 1;
        });
    });

    // Sort categories by count
    const topCategories = Object.entries(categoryMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }));

    // Calculate total members
    const totalMembers = communities.reduce((sum, c) => sum + c.member_count, 0);

    return NextResponse.json({
        total_communities: communities.length,
        total_members: totalMembers,
        platforms,
        top_categories: topCategories,
        last_updated: communitiesData.metadata.last_updated
    });
}
