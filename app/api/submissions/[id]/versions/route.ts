import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { setDocument, queryDocuments } from '@/lib/firebase/firestore';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUserId } from '@/lib/api-auth';
import { DirectorySubmission, SubmissionVersion, ActivityLog } from '@/types/distribution';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;

        const authUserId = await getAuthUserId(req);
        if (!authUserId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Verify ownership
        if (adminDb) {
            const subDoc = await adminDb.collection('directory_submissions').doc(id).get();
            if (!subDoc.exists) {
                return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
            }
            const submission = subDoc.data() as DirectorySubmission;

            const projectDoc = await adminDb.collection('launch_projects').doc(submission.project_id).get();
            if (!projectDoc.exists || projectDoc.data()?.user_id !== authUserId) {
                return NextResponse.json({ error: 'Forbidden: Access Denied' }, { status: 403 });
            }
        }

        const versions = await queryDocuments<SubmissionVersion>(
            'submission_versions',
            [{ field: 'submission_id', operator: '==', value: id }],
            'created_at',
            'desc'
        );
        return NextResponse.json({ versions });
    } catch (error) {
        console.error('Error fetching versions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await req.json();
        const { title, description, user_id, project_id, directory_name } = body;

        const authUserId = await getAuthUserId(req);
        if (authUserId !== user_id) {
            return NextResponse.json({ error: 'Unauthorized: Access Denied' }, { status: 401 });
        }

        // Verify project ownership
        if (adminDb) {
            const projectDoc = await adminDb.collection('launch_projects').doc(project_id).get();
            if (!projectDoc.exists || projectDoc.data()?.user_id !== authUserId) {
                return NextResponse.json({ error: 'Forbidden: Access Denied' }, { status: 403 });
            }
        }

        if (!title || !description) {
            return NextResponse.json({ error: 'Missing title or description' }, { status: 400 });
        }

        // Get current max version number
        const existing = await queryDocuments<SubmissionVersion>(
            'submission_versions',
            [{ field: 'submission_id', operator: '==', value: id }],
            'version_number',
            'desc',
            1
        );
        const version_number = existing.length > 0 ? existing[0].version_number + 1 : 1;

        const newVersion: SubmissionVersion = {
            id: uuidv4(),
            submission_id: id,
            title,
            description,
            version_number,
            created_at: new Date()
        };

        await setDocument('submission_versions', newVersion.id, newVersion as any);

        if (user_id && project_id) {
            const log: ActivityLog = {
                id: uuidv4(),
                project_id,
                user_id,
                action_type: 'copy_updated',
                metadata: { directory_name, version_number },
                created_at: new Date()
            };
            await setDocument('activity_logs', log.id, log as any);
        }

        return NextResponse.json({ version: newVersion }, { status: 201 });
    } catch (error) {
        console.error('Error creating version:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
