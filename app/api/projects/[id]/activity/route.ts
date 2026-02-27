import { NextResponse } from 'next/server';
import { queryDocuments } from '@/lib/firebase/firestore';
import { ActivityLog } from '@/types/distribution';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const activity = await queryDocuments<ActivityLog>(
            'activity_logs',
            [{ field: 'project_id', operator: '==', value: id }],
            'created_at',
            'desc',
            50 // limit
        );
        return NextResponse.json({ activity });
    } catch (error) {
        console.error('Error fetching activity logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
