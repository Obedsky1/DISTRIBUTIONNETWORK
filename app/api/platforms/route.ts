import { NextResponse } from 'next/server';
import communitiesData from '@/data/communities.json';

export async function GET() {
    const communities: any[] = communitiesData.communities;

    // Get unique platforms
    const platforms = [...new Set(communities.map(c => c.platform))];

    return NextResponse.json({
        platforms
    });
}
