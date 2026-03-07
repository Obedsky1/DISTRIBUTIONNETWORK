import { NextResponse } from 'next/server';
import { getRedirectForSlug } from '@/lib/pseo/platforms';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (!slug) {
        return NextResponse.json({ error: 'Missing slug parameter' }, { status: 400 });
    }

    const newSlug = await getRedirectForSlug(slug);

    return NextResponse.json({ newSlug });
}
