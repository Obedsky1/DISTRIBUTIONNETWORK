import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { adminDb } from '@/lib/firebase/admin';
import { DirectorySubmission, ActivityLog } from '@/types/distribution';

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const projectId = url.searchParams.get('projectId');

        if (!projectId) {
            return NextResponse.json({ error: 'Missing projectId parameter' }, { status: 400 });
        }

        let submissions: DirectorySubmission[] = [];
        try {
            if (adminDb) {
                const submissionsSnapshot = await adminDb
                    .collection('directory_submissions')
                    .where('project_id', '==', projectId)
                    .orderBy('created_at', 'desc')
                    .get();

                submissions = submissionsSnapshot.docs.map(doc => doc.data() as DirectorySubmission);
            }
        } catch (dbError) {
            console.warn('Firebase error on GET submissions', dbError);
        }

        return NextResponse.json({ submissions });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { project_id, directory_id, directory_name, directory_url, user_id } = body;

        if (!project_id || !directory_id || !directory_name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const newSubmission: DirectorySubmission = {
            id: uuidv4(),
            project_id,
            directory_id,
            directory_name,
            directory_url,
            status: 'not_started',
            created_at: new Date(),
            updated_at: new Date()
        };

        try {
            if (adminDb) {
                await adminDb.collection('directory_submissions').doc(newSubmission.id).set(newSubmission);

                // Activity log
                if (user_id) {
                    const log: ActivityLog = {
                        id: uuidv4(),
                        project_id,
                        user_id,
                        action_type: 'directory_added',
                        metadata: { directory_name },
                        created_at: new Date()
                    };
                    await adminDb.collection('activity_logs').doc(log.id).set(log);
                }
            }
        } catch (dbError) {
            console.warn('Firebase error (likely unconfigured), returning success for optimistic UI', dbError);
        }

        return NextResponse.json({ submission: newSubmission }, { status: 201 });
    } catch (error: any) {
        console.error('Error creating submission:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
