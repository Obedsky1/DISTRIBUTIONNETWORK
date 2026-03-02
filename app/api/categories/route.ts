import { NextResponse } from 'next/server';
import communitiesData from '@/data/communities.json';

export async function GET() {
    const communities: any[] = communitiesData.communities;

    // Get all unique categories
    const categorySet = new Set<string>();
    communities.forEach(c => {
        c.categories.forEach((cat: string) => categorySet.add(cat));
    });

    const categories = Array.from(categorySet).sort();

    return NextResponse.json({
        categories
    });
}
