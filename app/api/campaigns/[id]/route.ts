import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUserId } from '@/lib/api-auth';
import { Campaign } from '@/types';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        if (!adminDb) {
            return NextResponse.json({ success: false, error: 'Firebase not configured' }, { status: 500 });
        }

        const authUserId = await getAuthUserId(req);
        if (!authUserId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const docRef = await adminDb.collection('campaigns').doc(id).get();

        if (!docRef.exists) {
            return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
        }

        const data = docRef.data() as Campaign;

        // Ownership check
        if (data.userId !== authUserId) {
            return NextResponse.json({ success: false, error: 'Forbidden: Access Denied' }, { status: 403 });
        }

        if (data.createdAt && (data.createdAt as any).toDate) data.createdAt = (data.createdAt as any).toDate();
        if (data.updatedAt && (data.updatedAt as any).toDate) data.updatedAt = (data.updatedAt as any).toDate();

        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error(`Error fetching campaign ${params.id}:`, error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;
        const body = await req.json();

        if (!adminDb) {
            return NextResponse.json({ success: false, error: 'Firebase not configured' }, { status: 500 });
        }

        const authUserId = await getAuthUserId(req);
        if (!authUserId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const docRef = await adminDb.collection('campaigns').doc(id).get();
        if (!docRef.exists) {
            return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
        }

        if (docRef.data()?.userId !== authUserId) {
            return NextResponse.json({ success: false, error: 'Forbidden: Access Denied' }, { status: 403 });
        }

        const updateData = {
            ...body,
            updatedAt: new Date()
        };

        await adminDb.collection('campaigns').doc(id).update(updateData);

        return NextResponse.json({ success: true, data: updateData });
    } catch (error: any) {
        console.error(`Error updating campaign ${params.id}:`, error);
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = params.id;

        if (!adminDb) {
            return NextResponse.json({ success: false, error: 'Firebase not configured' }, { status: 500 });
        }

        const authUserId = await getAuthUserId(req);
        if (!authUserId) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const docRef = await adminDb.collection('campaigns').doc(id).get();
        if (!docRef.exists) {
            return NextResponse.json({ success: false, error: 'Campaign not found' }, { status: 404 });
        }

        if (docRef.data()?.userId !== authUserId) {
            return NextResponse.json({ success: false, error: 'Forbidden: Access Denied' }, { status: 403 });
        }

        await adminDb.collection('campaigns').doc(id).delete();

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error(`Error deleting campaign ${params.id}:`, error);
        return NextResponse.json({ success: false, error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
