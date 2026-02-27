import { NextResponse } from 'next/server';
import { queryDocuments } from '@/lib/firebase/firestore';
import { ProjectAsset } from '@/types/distribution';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const assets = await queryDocuments<ProjectAsset>(
            'project_assets',
            [{ field: 'project_id', operator: '==', value: id }],
            'created_at',
            'desc'
        );
        return NextResponse.json({ assets });
    } catch (error) {
        console.error('Error fetching assets:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
// Note: Currently no POST handler as asset uploading usually requires integration directly with Firebase Storage from the client or specialized multipart endpoint.
