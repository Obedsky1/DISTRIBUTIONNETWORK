import { NextResponse } from 'next/server';
import communitiesData from '@/data/communities.json';
import directoriesData from '@/data/directories.json';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    // Get filter parameters
    const search = searchParams.get('search')?.toLowerCase() || '';
    const platform = searchParams.get('platform')?.toLowerCase() || '';
    const category = searchParams.get('category')?.toLowerCase() || '';
    const minMembers = parseInt(searchParams.get('minMembers') || '0');
    const maxMembers = parseInt(searchParams.get('maxMembers') || '999999999');
    const sortBy = searchParams.get('sortBy') || 'member_count';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Helper to parse traffic string to number for sorting
    const parseTraffic = (traffic: string | undefined) => {
        if (!traffic) return 0;
        const num = parseFloat(traffic.replace(/[^0-9.]/g, ''));
        if (traffic.includes('M')) return num * 1000000;
        if (traffic.includes('K')) return num * 1000;
        return num;
    };

    // Map directories to community structure
    const directories = (directoriesData.directories as any[]).map(d => ({
        id: `dir_${d.id}`,
        name: d.name,
        platform: 'Directory', // or d.platform if you want specific types
        description: d.description,
        url: d.url,
        invite_link: d.url,
        member_count: parseTraffic(d.monthly_traffic), // Use traffic as proxy for members/popularity
        categories: [d.category, ...(d.best_for || [])],
        image_url: '', // Todo: add icons
        is_directory: true // Flag for UI if needed
    }));

    let communities: any[] = [...(communitiesData.communities as any[]), ...directories];

    // Apply filters
    if (search) {
        communities = communities.filter(c =>
            c.name.toLowerCase().includes(search) ||
            (c.description || '').toLowerCase().includes(search) ||
            c.categories.some((cat: string) => cat.toLowerCase().includes(search))
        );
    }

    if (platform && platform !== 'all') {
        communities = communities.filter(c =>
            c.platform.toLowerCase() === platform
        );
    }

    if (category) {
        communities = communities.filter(c =>
            c.categories.some((cat: string) => cat.toLowerCase().includes(category))
        );
    }

    if (minMembers > 0) {
        communities = communities.filter(c => c.member_count >= minMembers);
    }

    if (maxMembers < 999999999) {
        communities = communities.filter(c => c.member_count <= maxMembers);
    }

    // Apply sorting
    communities = communities.sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'member_count':
                comparison = a.member_count - b.member_count;
                break;
            case 'name':
                comparison = a.name.localeCompare(b.name);
                break;
            default:
                comparison = a.member_count - b.member_count;
        }
        return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    const total = communities.length;
    communities = communities.slice(offset, offset + limit);

    return NextResponse.json({
        communities,
        total,
        offset,
        limit,
        hasMore: offset + limit < total
    });
}
