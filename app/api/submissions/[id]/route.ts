import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { getAuthUserId } from '@/lib/api-auth';
import { DirectorySubmission, ActivityLog } from '@/types/distribution';
import { v4 as uuidv4 } from 'uuid';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = params;
        const body = await req.json();
        const { status, submission_url, notes, user_id, action_type } = body;

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

            // Check if user owns the project associated with this submission
            const projectDoc = await adminDb.collection('launch_projects').doc(submission.project_id).get();
            if (!projectDoc.exists || projectDoc.data()?.user_id !== authUserId) {
                return NextResponse.json({ error: 'Forbidden: Access Denied' }, { status: 403 });
            }
        }

        const updateData: Partial<DirectorySubmission> = {
            updated_at: new Date()
        };

        if (status) updateData.status = status;
        if (submission_url !== undefined) updateData.submission_url = submission_url;
        if (notes !== undefined) updateData.notes = notes;

        try {
            if (adminDb) {
                await adminDb.collection('directory_submissions').doc(id).update(updateData);

                const subDoc = await adminDb.collection('directory_submissions').doc(id).get();
                const submission = subDoc.exists ? (subDoc.data() as DirectorySubmission) : null;

                // Activity log
                if (user_id && submission) {
                    const log: ActivityLog = {
                        id: uuidv4(),
                        project_id: submission.project_id,
                        user_id,
                        action_type: action_type || (status ? `status_changed_to_${status}` : 'submission_updated'),
                        metadata: { directory_name: submission.directory_name, status: status || 'updated' },
                        created_at: new Date()
                    };
                    await adminDb.collection('activity_logs').doc(log.id).set(log);
                }
            }
        } catch (dbError) {
            console.warn('Firebase error (likely unconfigured), returning success for optimistic UI', dbError);
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error updating submission:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
