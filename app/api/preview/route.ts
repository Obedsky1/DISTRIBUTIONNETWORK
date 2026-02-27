import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    if (!url) {
        return NextResponse.json({ error: 'Missing url param' }, { status: 400 });
    }

    try {
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; CommunityForMe/1.0; +https://communityfor.me)',
                'Accept': 'text/html,application/xhtml+xml',
            },
            signal: AbortSignal.timeout(8000),
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const html = await res.text();

        const get = (pattern: RegExp) => {
            const m = html.match(pattern);
            return m ? m[1].replace(/&amp;/g, '&').replace(/&quot;/g, '"').trim() : null;
        };

        const title =
            get(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
            get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i) ||
            get(/<title[^>]*>([^<]+)<\/title>/i) ||
            url;

        const description =
            get(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i) ||
            get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i) ||
            get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
            get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i) ||
            null;

        const image =
            get(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
            get(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i) ||
            null;

        // resolve favicon
        const origin = new URL(url).origin;
        const favicon = `${origin}/favicon.ico`;

        return NextResponse.json({ title, description, image, favicon, origin });
    } catch (err) {
        return NextResponse.json(
            { error: err instanceof Error ? err.message : 'Failed to fetch preview' },
            { status: 502 }
        );
    }
}
