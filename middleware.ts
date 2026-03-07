import { NextRequest, NextResponse } from 'next/server';

/**
 * Middleware: handles platform slug redirects at the edge.
 * Only processes /platform/ routes for redirect checks.
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Only handle platform page redirects
    if (!pathname.startsWith('/platform/')) {
        return NextResponse.next();
    }

    const slug = pathname.replace('/platform/', '');

    // Check for redirects via an API call (avoids importing Firebase Admin at edge)
    try {
        const redirectRes = await fetch(
            `${request.nextUrl.origin}/api/seo/redirect?slug=${encodeURIComponent(slug)}`,
            { next: { revalidate: 3600 } } // Cache for 1 hour
        );

        if (redirectRes.ok) {
            const data = await redirectRes.json();
            if (data.newSlug) {
                return NextResponse.redirect(
                    new URL(`/platform/${data.newSlug}`, request.url),
                    { status: 301 }
                );
            }
        }
    } catch {
        // Redirect check failed — continue normally
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/platform/:slug*'],
};
