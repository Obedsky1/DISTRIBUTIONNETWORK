import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUserId } from '@/lib/api-auth';
import { Campaign, CampaignType, CampaignStatus } from '@/types';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const userId = url.searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'Missing userId parameter' }, { status: 400 });
        }

        const authUserId = await getAuthUserId(req);
        if (authUserId !== userId) {
            return NextResponse.json({ error: 'Unauthorized: Access Denied' }, { status: 401 });
        }

        let campaigns: Campaign[] = [];
        try {
            if (adminDb) {
                const snapshot = await adminDb
                    .collection('campaigns')
                    .where('userId', '==', userId)
                    .get(); // no orderBy to avoid needing a composite index

                campaigns = snapshot.docs.map(doc => {
                    const data = doc.data() as Campaign;
                    if (data.createdAt && (data.createdAt as any).toDate) data.createdAt = (data.createdAt as any).toDate();
                    if (data.updatedAt && (data.updatedAt as any).toDate) data.updatedAt = (data.updatedAt as any).toDate();
                    return data;
                });

                // Sort descending by createdAt in-memory
                campaigns.sort((a, b) => {
                    const ta = a.createdAt ? new Date(a.createdAt as any).getTime() : 0;
                    const tb = b.createdAt ? new Date(b.createdAt as any).getTime() : 0;
                    return tb - ta;
                });
            }
        } catch (dbError) {
            console.warn('Firebase error on GET campaigns', dbError);
        }

        return NextResponse.json({ success: true, data: campaigns });
    } catch (error) {
        console.error('Error fetching campaigns:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, type, name, config, targets } = body;

        if (!userId || !type || !name) {
            return NextResponse.json({ success: false, error: 'Missing required fields: userId, type, name' }, { status: 400 });
        }

        const authUserId = await getAuthUserId(req);
        if (authUserId !== userId) {
            return NextResponse.json({ error: 'Unauthorized: Access Denied' }, { status: 401 });
        }

        const newCampaign: Campaign = {
            id: uuidv4(),
            userId,
            type: type as CampaignType,
            status: 'draft' as CampaignStatus,
            name,
            config: config || {},
            targets: targets || [],
            currentBatchIndex: 0,
            submissions: [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        try {
            if (adminDb) {
                await adminDb.collection('campaigns').doc(newCampaign.id as string).set(newCampaign);
            }
        } catch (dbError) {
            console.warn('Firebase error on POST campaigns (optimistic UI allowed)', dbError);
        }

        return NextResponse.json({ success: true, data: newCampaign }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating campaign:', error);
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
