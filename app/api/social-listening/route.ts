import { NextResponse } from 'next/server';
import { fetchSocialListeningData } from '@/lib/xpoz/client';
import { generateSocialReply } from '@/lib/ai/groq-client';
import { getAuthUserId } from '@/lib/api-auth';
import { adminDb } from '@/lib/firebase/admin';

// POST /api/social-listening — Scan for posts (NO AI replies — saves cost)
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { keyword, generateReplyForId, postContent, campaignContext } = body;

        const authUserId = await getAuthUserId(req);
        if (!authUserId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Verify premium status
        if (adminDb) {
            const userDoc = await adminDb.collection('users').doc(authUserId).get();
            if (!userDoc.exists || !userDoc.data()?.isPremium) {
                return NextResponse.json({ success: false, error: 'Social Listening is a Premium feature. Please upgrade to Pro.' }, { status: 403 });
            }
        }

        // ── On-demand reply generation for a SINGLE post ──
        if (generateReplyForId && postContent) {
            const ctx = campaignContext || `We are a startup helping users who need ${keyword || 'a solution'}.`;
            const reply = await generateSocialReply(postContent, ctx);
            return NextResponse.json({ success: true, reply });
        }

        // ── Normal scan: fetch posts WITHOUT generating AI replies ──
        if (!keyword) {
            return NextResponse.json({ success: false, error: 'Keyword is required' }, { status: 400 });
        }

        const posts = await fetchSocialListeningData(keyword);

        // Return posts directly — no AI cost incurred during scan
        return NextResponse.json({
            success: true,
            data: posts.map(post => ({
                ...post,
                suggestedReply: null, // User must tap "Generate Reply" manually
            }))
        });

    } catch (error: any) {
        console.error('API Route Error /social-listening:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
