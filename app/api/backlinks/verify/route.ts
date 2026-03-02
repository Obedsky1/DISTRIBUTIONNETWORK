import { NextResponse } from 'next/server';
import { checkBacklink } from '@/lib/backlinkChecker';

export async function POST(req: Request) {
    try {
        const { liveUrl, targetDomain } = await req.json();

        if (!liveUrl || !targetDomain) {
            return NextResponse.json({ error: 'Live URL and Target Domain are required' }, { status: 400 });
        }

        const cleanDomain = targetDomain.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

        const result = await checkBacklink(liveUrl, cleanDomain);

        return NextResponse.json({ success: true, result });
    } catch (error: any) {
        console.error('Backlink verification error:', error);
        return NextResponse.json({ error: 'Failed to verify backlink' }, { status: 500 });
    }
}
